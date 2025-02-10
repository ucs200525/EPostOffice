const express = require('express');
const router = express.Router();
const Package = require('../../Not neededany more/Package');
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
const mongoose = require('mongoose');

// Helper function to generate tracking number
const generateTrackingNumber = () => {
    const prefix = 'EPO';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

// Send a package
router.post('/send', async (req, res) => {
    try {
        const { type, weight, dimensions, recipientName, recipientPhone, recipientAddress, serviceType, fragile, insurance, senderId, estimatedCost } = req.body;

        // Generate unique tracking number
        const trackingNumber = generateTrackingNumber();

        // Find the sender
        const sender = await Customer.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        // Check if the sender has enough balance
        if (sender.walletBalance < estimatedCost) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Create a new package with tracking and status info
        const newPackage = new Package({
            trackingNumber,
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
            estimatedCost,
            status: 'pending',
            isActive: true,
            trackingHistory: [{
                status: 'pending',
                location: 'Post Office',
                timestamp: new Date(),
                description: 'Package registered in the system'
            }]
        });

        await newPackage.save();

        // Create a debit transaction for the package cost
        const newTransaction = new Transaction({
            customerId: senderId,
            type: 'debit',
            amount: estimatedCost,
            description: `Payment for package ${trackingNumber}`
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

// Get user's shipments
router.get('/:userId/shipments', async (req, res) => {
    try {
        const shipments = await Package.find({ senderId: req.params.userId })
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({ 
            success: true,
            shipments 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching shipments',
            error: error.message 
        });
    }
});

// Get user's package statistics
router.get('/:userId/stats', async (req, res) => {
    try {
        // Fix the ObjectId conversion
        const userId = new mongoose.Types.ObjectId(req.params.userId);
        
        const stats = await Package.aggregate([
            { $match: { senderId: userId } },
            { 
                $group: {
                    _id: null,
                    active: { 
                        $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                    },
                    transit: { 
                        $sum: { $cond: [{ $eq: ["$status", "in_transit"] }, 1, 0] }
                    },
                    delivered: { 
                        $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] }
                    },
                    total: { $sum: 1 }
                }
            }
        ]);

        // Ensure we always return a valid stats object
        const defaultStats = {
            active: 0,
            transit: 0,
            delivered: 0,
            total: 0
        };

        res.status(200).json({
            success: true,
            stats: stats.length > 0 ? stats[0] : defaultStats
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router;
