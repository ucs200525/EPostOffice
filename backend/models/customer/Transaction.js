const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  transactionType: {  
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

// Automatically update wallet balance when a transaction is saved
transactionSchema.pre('save', async function (next) {
    const transaction = this;
    const customer = await mongoose.model('Customer').findById(transaction.customerId);

    if (!customer) {
        throw new Error('Customer not found');
    }

    if (transaction.transactionType === 'CREDIT') {
        await customer.updateWalletBalance(transaction.amount);
    } else if (transaction.transactionType === 'DEBIT') {
        await customer.updateWalletBalance(-transaction.amount);
    }

    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
