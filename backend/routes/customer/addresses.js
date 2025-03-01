const express = require('express');
const router = express.Router();
const Notification = require('../../models/Notification');
const logger = require('../../utils/logger');

// Get all notifications for a customer
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('relatedOrder');

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        logger.error(`Error fetching notifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        logger.error(`Error marking notification as read: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message
        });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        logger.error(`Error marking all notifications as read: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message
        });
    }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        logger.error(`Error getting unread notification count: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error getting unread notification count',
            error: error.message
        });
    }
});

module.exports = router;