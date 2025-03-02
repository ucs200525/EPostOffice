const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order');
const auth = require('../../middleware/auth');

// Get package statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Calculate package statistics
        const stats = {
            orderId: order._id,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            // Add more statistics as needed
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;