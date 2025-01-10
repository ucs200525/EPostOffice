const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const Customer = require('../models/User');
const Transaction = require('../models/Transaction');

// Send a package
router.post('/send', async (req, res) => {
    try {
        const { type, weight, dimensions, recipientName, recipientPhone, recipientAddress, serviceType, fragile, insurance, senderId, estimatedCost } = req.body;

        // Find the sender
        const sender = await Customer.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Check if the sender has enough balance
        if (sender.walletBalance < estimatedCost) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Create a new package
        const newPackage = new Package({
            type,
            weight,
            dimensions,
            recipientName,
            recipientPhone,
            recipientAddress,
            serviceType,
            fragile,
            insurance,
            senderId,
            estimatedCost
        });

        await newPackage.save();

        // Create a debit transaction for the package cost
        const newTransaction = new Transaction({
            customerId: senderId,
            type: 'debit',
            amount: estimatedCost,
            description: `Payment for sending package to ${recipientName}`
        });

        await newTransaction.save();
        await sender.updateWalletBalance(-estimatedCost);

        res.status(201).json({
            message: 'Package sent successfully',
            package: newPackage,
            newBalance: sender.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending package', error: error.message });
    }
});

module.exports = router;
