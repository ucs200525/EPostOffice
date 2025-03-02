const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const Staff = require('../../models/staff/Staff');
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
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
        res.status(201).json({ message: 'Staff member created successfully', staff: newStaff });
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
        const staff = await Staff.find().select('-password').populate('branch', 'name location');
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
        const staff = await Staff.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
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
        if (!staff) return res.status(404).json({ message: 'Staff not found' });
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
            branchStats: await Staff.aggregate([{ $group: { _id: '$branch', count: { $sum: 1 } } }]),
            roleStats: await Staff.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
        };
        res.json(stats);
    } catch (error) {
        logger.error(`Get admin stats error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/admin/login
 * @desc    Admin Login
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Customer.findOne({ email, role: 'admin' });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, admin: { id: admin._id, email: admin.email, username: admin.username } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/admin/profile
 * @desc    Get Admin Profile
 * @access  Admin only
 */
router.get('/profile', async (req, res) => {
    try {
        const admin = await Customer.findById(req.user.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/admin/profile
 * @desc    Update Admin Profile
 * @access  Admin only
 */
router.put('/profile', async (req, res) => {
    try {
        const { username, email } = req.body;
        const admin = await Customer.findById(req.user.id);
        if (username) admin.username = username;
        if (email) admin.email = email;
        await admin.save();
        res.json({ message: 'Profile updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change Admin Password
 * @access  Admin only
 */
router.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Customer.findById(req.user.id);
        if (!(await admin.comparePassword(currentPassword))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        admin.password = newPassword;
        await admin.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    Get Dashboard Stats
 * @access  Admin only
 */
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalStaff = await Staff.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: 'active' });
        const totalRevenue = (await Transaction.find()).reduce((sum, t) => sum + t.amount, 0);
        res.json({ success: true, stats: { totalStaff, activeCustomers, totalRevenue } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
    }
});

/**
 * @route   POST /api/admin/register-staff
 * @desc    Register Staff Member
 * @access  Admin only
 */
router.post('/register-staff', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) return res.status(400).json({ message: 'Staff already exists' });

        const newStaff = new Staff({ name, email, password, role });
        await newStaff.save();
        res.status(201).json({ message: 'Staff registered successfully', staff: newStaff });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
