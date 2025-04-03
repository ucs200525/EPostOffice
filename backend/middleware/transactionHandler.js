const mongoose = require('mongoose');
const Customer = require('../models/customer/Customer');

const handleTransaction = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, orderId, amount } = req.body;

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.walletBalance < amount) {
      throw new Error('Insufficient funds');
    }

    // Update wallet balance
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { walletBalance: -amount } },
      { session, new: true }
    );

    // Add transaction metadata to the request
    req.transactionData = {
      session,
      previousBalance: customer.walletBalance,
      newBalance: customer.walletBalance - amount
    };

    next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { handleTransaction };