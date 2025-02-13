const express = require('express');
const router = express.Router();
const Staff = require('../../models/staff/Staff');
const adminAuth = require('../../middleware/adminAuth');
const logger = require('../../utils/logger');

/**
 * @route   POST /api/admin/staff
 * @desc    Create new staff member
 * @access  Admin only
 */
router.post('/staff', adminAuth, async (req, res) => {
    try {
        const newStaff = new Staff(req.body);
        await newStaff.save();
        res.status(201).json({
            message: 'Staff member created successfully',
            staff: newStaff
        });
    } catch (error) {
        logger.error(`Create staff error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/admin/staff
 * @desc    Get all staff members
 * @access  Admin only
 */
router.get('/staff', adminAuth, async (req, res) => {
    try {
        const staff = await Staff.find()
            .select('-password')
            .populate('branch', 'name location');
        res.json(staff);
    } catch (error) {
        logger.error(`Get all staff error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/admin/staff/:id
 * @desc    Update staff member
 * @access  Admin only
 */
router.put('/staff/:id', adminAuth, async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json({ message: 'Staff updated successfully', staff });
    } catch (error) {
        logger.error(`Update staff error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/admin/staff/:id
 * @desc    Delete staff member
 * @access  Admin only
 */
router.delete('/staff/:id', adminAuth, async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        logger.error(`Delete staff error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin only
 */
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = {
            totalStaff: await Staff.countDocuments(),
            activeStaff: await Staff.countDocuments({ status: 'active' }),
            branchStats: await Staff.aggregate([
                { $group: { _id: '$branch', count: { $sum: 1 } } }
            ]),
            roleStats: await Staff.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ])
        };
        res.json(stats);
    } catch (error) {
        logger.error(`Get admin stats error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
