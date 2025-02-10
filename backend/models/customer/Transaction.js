const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: {  // Changed from userId to customerId
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  transactionType: {  // Changed from type to transactionType
    type: String,
    enum: ['DEBIT', 'CREDIT', 'REFUND'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a transaction and update wallet balance
transactionSchema.pre('save', async function (next) {
    const transaction = this;
    const customer = await mongoose.model('Customer').findById(transaction.customerId);

    if (!customer) {
        throw new Error('Customer not found');
    }

    // If it's a debit or credit, update the customer's wallet balance
    if (transaction.transactionType === 'CREDIT') {
        await customer.updateWalletBalance(transaction.amount); // Add the amount to the wallet balance
    } else if (transaction.transactionType === 'DEBIT') {
        await customer.updateWalletBalance(-transaction.amount); // Subtract the amount from the wallet balance
    }

    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
