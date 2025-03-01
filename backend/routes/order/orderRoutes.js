const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user.id })
            .populate('items')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new order
router.post('/', async (req, res) => {
    try {
        const order = new Order({
            customerId: req.user.id,
            ...req.body
        });
        await order.save();
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customerId: req.user.id
        }).populate('items');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, customerId: req.user.id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
