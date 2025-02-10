const express = require('express');
const router = express.Router();
const Staff = require('../../models/staff/Staff');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const Order = require('../../Not neededany more/Shipping');

/**
 * @route   POST /api/staff/login
 * @desc    Staff login and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (staff.status !== 'active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        const isMatch = await staff.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        staff.lastLogin = new Date();
        await staff.save();

        const token = jwt.sign(
            { id: staff._id, role: staff.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            staff: {
                id: staff._id,
                email: staff.email,
                username: staff.username,
                role: staff.role,
                firstName: staff.firstName,
                lastName: staff.lastName
            }
        });
    } catch (error) {
        logger.error(`Staff login error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/staff/profile
 * @desc    Get staff profile
 * @access  Private
 */
router.get('/profile',  async (req, res) => {
    try {
        const staff = await Staff.findById(req.user.id)
            .select('-password')
            .populate('branch', 'name location');
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }
        res.json(staff);
    } catch (error) {
        logger.error(`Get staff profile error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/staff/profile
 * @desc    Update staff profile
 * @access  Private
 */
router.put('/profile',  async (req, res) => {
    try {
        const { firstName, lastName, contactNumber, address } = req.body;
        const staff = await Staff.findById(req.user.id);
        
        if (firstName) staff.firstName = firstName;
        if (lastName) staff.lastName = lastName;
        if (contactNumber) staff.contactNumber = contactNumber;
        if (address) staff.address = address;
        
        await staff.save();
        res.json({ message: 'Profile updated successfully', staff });
    } catch (error) {
        logger.error(`Update staff profile error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/staff/tasks
 * @desc    Get staff tasks based on role
 * @access  Private
 */
router.get('/tasks',  async (req, res) => {
    try {
        const staff = await Staff.findById(req.user.id);
        let tasks;

        switch (staff.role) {
            case 'counter_staff':
                tasks = await Package.find({ 
                    'receivingBranch': staff.branch,
                    'status': 'pending'
                });
                break;
            case 'sorting_staff':
                tasks = await Package.find({
                    'currentBranch': staff.branch,
                    'status': 'processing'
                });
                break;
            case 'delivery_staff':
                tasks = await Package.find({
                    'deliveryStaff': staff._id,
                    'status': 'out_for_delivery'
                });
                break;
        }

        res.json(tasks);
    } catch (error) {
        logger.error(`Get staff tasks error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PUT /api/staff/change-password
 * @desc    Change staff password
 * @access  Private
 */
router.put('/change-password',  async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const staff = await Staff.findById(req.user.id);

        const isMatch = await staff.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        staff.password = newPassword;
        await staff.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error(`Change staff password error: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/staff/stats/:staffId
 * @desc    Get staff stats
 * @access  Private
 */
router.get('/stats/:staffId',  async (req, res) => {
    try {
        const staffId = req.params.staffId;
        const staff = await Staff.findById(staffId);
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        // Get delivery stats
        const deliveriesCompleted = await Order.countDocuments({ 
            assignedStaff: staffId, 
            status: 'delivered' 
        });

        const pendingDeliveries = await Order.countDocuments({ 
            assignedStaff: staffId, 
            status: 'pending' 
        });

        // Get today's tasks
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todaysTasks = await Order.find({
            assignedStaff: staffId,
            scheduledDelivery: {
                $gte: todayStart,
                $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
            }
        }).select('type status location scheduledTime description');

        // Calculate rating
        const staffRating = staff.ratings?.length > 0 
            ? staff.ratings.reduce((sum, r) => sum + r, 0) / staff.ratings.length 
            : 0;

        res.json({
            success: true,
            stats: {
                deliveriesCompleted,
                pendingDeliveries,
                customerRating: staffRating,
                todaysTasks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff stats',
            error: error.message
        });
    }
});

module.exports = router;
