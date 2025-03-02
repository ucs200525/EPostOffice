const express = require('express');
const router = express.Router();
const Customer = require('../../models/customer/Customer');
const auth = require('../../middleware/auth');

// Get notification settings
router.get('/settings', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .select('notificationSettings');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer.notificationSettings || {
                emailNotifications: true,
                smsNotifications: true,
                orderUpdates: true,
                promotionalEmails: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update notification settings
router.put('/settings', auth, async (req, res) => {
    try {
        const { emailNotifications, smsNotifications, orderUpdates, promotionalEmails } = req.body;
        
        const customer = await Customer.findByIdAndUpdate(
            req.user.id,
            {
                notificationSettings: {
                    emailNotifications,
                    smsNotifications,
                    orderUpdates,
                    promotionalEmails
                }
            },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: customer.notificationSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get notifications
router.get('/', auth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.user.id)
            .select('notifications')
            .populate('notifications');

        // Ensure we always return an array
        const notifications = customer?.notifications || [];

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const notification = customer.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isRead = true;
        await customer.save();

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const customer = await Customer.findById(req.user.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        customer.notifications = customer.notifications.filter(
            notification => notification._id.toString() !== notificationId
        );

        await customer.save();

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
