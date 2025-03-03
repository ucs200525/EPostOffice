const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order');
const auth = require('../../middleware/auth');

// Get all orders for the logged-in user - Remove items population
router.get('/my-orders/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const orders = await Order.find({ customerId })
            // Remove .populate('items') since it doesn't exist
            .sort({ createdAt: -1 });

        // Calculate stats from orders
        const stats = {
            active: orders.filter(order => order.status === 'pending').length,
            transit: orders.filter(order => order.status === 'in-transit').length,
            completed: orders.filter(order => order.status === 'delivered').length,
            total: orders.length
        };

        res.json({
            success: true,
            data: orders,
            stats
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching orders'
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

// Get order by ID - Remove items population
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customerId: req.user.id
        }); // Remove .populate('items')
        
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
