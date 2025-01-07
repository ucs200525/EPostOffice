// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Parcel = require('../models/Parcel');
// const Feedback = require('../models/Feedback');
// const { authenticateToken } = require('../middleware/auth');
// const logger = require('../utils/logger');

// // Create new parcel
// router.post('/parcels', authenticateToken, async (req, res) => {
//     try {
//         const parcel = new Parcel({
//             sender: req.user.id,
//             ...req.body
//         });
//         await parcel.save();
        
//         logger.info(`New parcel created: ${parcel.trackingNumber}`);
//         res.status(201).json(parcel);
//     } catch (error) {
//         logger.error(`Parcel creation error: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get customer's parcels
// router.get('/parcels', authenticateToken, async (req, res) => {
//     try {
//         const parcels = await Parcel.find({ sender: req.user.id })
//                                   .populate('assignedTo', 'name');
//         res.json(parcels);
//     } catch (error) {
//         logger.error(`Error fetching parcels: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// });

// // Submit feedback
// router.post('/feedback', authenticateToken, async (req, res) => {
//     try {
//         const feedback = new Feedback({
//             customer: req.user.id,
//             ...req.body
//         });
//         await feedback.save();
        
//         logger.info(`New feedback submitted by user: ${req.user.id}`);
//         res.status(201).json(feedback);
//     } catch (error) {
//         logger.error(`Feedback submission error: ${error.message}`);
//         res.status(500).json({ message: error.message });
//     }
// });

// // ...additional routes as needed...

// module.exports = router;


const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Pickup = require('../models/Pickup');
const Transaction = require('../models/Transaction');
const Customer = require('../models/User');

// Place an order
router.post('/place-order', async (req, res) => {
    try {
        const { customerId, items, totalAmount, status } = req.body;

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Create the order
        const newOrder = new Order({
            customerId,
            items,
            totalAmount,
            status
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: newOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get Wallet Balance for Customer
router.get('/:customerId/wallet', async (req, res) => {
    try {
        const { customerId } = req.params;

        // Fetch all transactions for the customer
        const transactions = await Transaction.find({ customerId });

        // Calculate wallet balance
        let walletBalance = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'credit') {
                walletBalance += transaction.amount;  // Add credits
            } else if (transaction.type === 'debit') {
                walletBalance -= transaction.amount;  // Subtract debits
            }
        });

        res.status(200).json({
            customerId,
            balance : transactions.walletBalanceAfterTransaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet balance', error: error.message });
    }
});

// Get all orders for a customer
router.get('/:customerId/orders', async (req, res) => {
    try {
        const { customerId } = req.params;

        const orders = await Order.find({ customerId });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Plan a pickup
router.post('/plan-pickup', async (req, res) => {
    try {
        const { customerId, address, timeSlot, description } = req.body;

        // Create a pickup request
        const newPickup = new Pickup({
            customerId,
            address,
            timeSlot,
            description
        });

        await newPickup.save();

        res.status(201).json({
            success: true,
            message: 'Pickup planned successfully',
            pickup: newPickup
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all pickups for a customer
router.get('/pickups/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const pickups = await Pickup.find({ customerId });

        if (!pickups.length) {
            return res.status(404).json({ message: 'No pickups found' });
        }

        res.json({
            success: true,
            pickups
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get transaction history for a customer
router.get('/:customerId/transactions', async (req, res) => {
    try {
        const { customerId } = req.params;

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get all transactions for the customer
        const transactions = await Transaction.find({ customerId });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found' });
        }

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a transaction (credit or debit)
router.post('/add-transaction', async (req, res) => {
    try {
        const { customerId, type, amount, description } = req.body;

        // Find the customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Create a new transaction
        const newTransaction = new Transaction({
            customerId,
            type,
            amount,
            description
        });

        await newTransaction.save();

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            transaction: newTransaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Top Up Wallet
router.post('/topup', async (req, res) => {
    try {
        const { customerId, amount, paymentDetails } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Create a credit transaction
        const newTransaction = new Transaction({
            customerId,
            type: 'credit',
            amount,
            description: 'Wallet top-up'
        });

        await newTransaction.save();
        await customer.updateWalletBalance(amount);

        res.status(200).json({
            message: 'Wallet topped up successfully',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing top-up', error: error.message });
    }
});

// Pay for Order
router.post('/payForOrder', async (req, res) => {
    try {
        const { customerId, orderId, amount } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customer.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Create a debit transaction
        const newTransaction = new Transaction({
            customerId,
            type: 'debit',
            amount,
            description: `Payment for order ${orderId}`
        });

        await newTransaction.save();
        await customer.updateWalletBalance(-amount);

        res.status(200).json({
            message: 'Payment successful',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
});

// Plan Pickup
router.post('/planPickup', async (req, res) => {
    try {
        const { customerId, pickupDetails, amount } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customer.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient funds for pickup' });
        }

        // Create a debit transaction
        const newTransaction = new Transaction({
            customerId,
            type: 'debit',
            amount,
            description: 'Pickup payment'
        });

        await newTransaction.save();
        await customer.updateWalletBalance(-amount);

        res.status(200).json({
            message: 'Pickup planned and payment successful',
            newBalance: customer.walletBalance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing pickup', error: error.message });
    }
});

module.exports = router;
