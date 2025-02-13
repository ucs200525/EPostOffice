const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateToken = require('../../../middleware/auth');
const Order = require('../../models/Order');
const User = require('..../../models/customer/Customer');
const logger = require('../../../utils/logger');
const Transaction = require('../../models/Transaction');

// Verify shipping order
router.get('/verify/:trackingNumber', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({
      success: true,
      order
    });
  } catch (error) {
    logger.error(`Order verification failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to verify order'
    });
  }
});

// Create shipping order with transaction
router.post('/create', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, cost, ...shippingDetails } = req.body;

    // 1. Verify user and check balance
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.walletBalance < cost) {
      throw new Error('Insufficient balance');
    }

    // 2. Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // 3. Create transaction record
    const transaction = await Transaction.create([{
      userId,
      type: 'DEBIT',
      amount: cost,
      description: `Shipping order: ${trackingNumber}`,
      status: 'completed'
    }], { session });

    // 4. Update user wallet
    await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: -cost } },
      { session, new: true }
    );

    // 5. Create shipping order
    const order = await Order.create([{
      userId,
      trackingNumber,
      shippingDetails,
      cost,
      status: 'pending',
      transactionId: transaction[0]._id
    }], { session });

    // 6. Commit transaction
    await session.commitTransaction();

    logger.info(`Order created successfully: ${trackingNumber}`);
    res.json({
      success: true,
      trackingNumber,
      orderId: order[0]._id,
      shipment: order[0]
    });

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Order creation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    session.endSession();
  }
});

function generateTrackingNumber() {
  const prefix = 'EP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}${timestamp}`;
}

module.exports = router;
