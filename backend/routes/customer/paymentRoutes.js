const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { handleTransaction } = require('../../middleware/transactionHandler');
const Order = require('../../models/order/Order');
const Transaction = require('../../models/customer/Transaction');

router.post('/payForOrder', auth, handleTransaction, async (req, res) => {
  const { session, previousBalance, newBalance } = req.transactionData;
  const { customerId, orderId, amount } = req.body;

  try {
    // Create transaction record
    const transaction = new Transaction({
      customerId,
      orderId,
      amount,
      type: 'debit',
      previousBalance,
      newBalance,
      description: `Payment for order ${orderId}`
    });

    await transaction.save({ session });

    // Update order status
    await Order.findByIdAndUpdate(
      orderId,
      { status: 'confirmed' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Payment successful',
      transaction: {
        id: transaction._id,
        amount,
        newBalance
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      success: false,
      message: 'Payment failed',
      error: error.message
    });
  }
});

module.exports = router;