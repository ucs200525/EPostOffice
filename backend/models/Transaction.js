const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    type: {
        type: String,
        enum: ['Credit', 'Debit'],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// // Virtual property to calculate the current wallet balance for a customer
// transactionSchema.virtual('walletBalance').get(async function () {
//     const transactions = await mongoose.model('Transaction').find({ customerId: this.customerId });
//     let balance = 0;
//     transactions.forEach(transaction => {
//         if (transaction.type === 'Credit') {
//             balance += transaction.amount;
//         } else if (transaction.type === 'Debit') {
//             balance -= transaction.amount;
//         }
//     });
//     return balance;
// });


// Create a transaction and update wallet balance
transactionSchema.pre('save', async function (next) {
    const transaction = this;
    const customer = await mongoose.model('User').findById(transaction.customerId);

    if (!customer) {
        throw new Error('Customer not found');
    }

    // If it's a debit or credit, update the customer's wallet balance
    if (transaction.type === 'credit') {
        await customer.updateWalletBalance(transaction.amount); // Add the amount to the wallet balance
    } else if (transaction.type === 'debit') {
        await customer.updateWalletBalance(-transaction.amount); // Subtract the amount from the wallet balance
    }

    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
