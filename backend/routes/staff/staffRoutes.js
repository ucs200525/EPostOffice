const express = require('express');
const router = express.Router();
const Staff = require('../../models/staff/Staff');
const Customer = require('../../models/customer/Customer');
const Order = require('../../models/order/Order');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

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

/**
 * @route   GET /api/staff/customers
 * @desc    Get all customers
 * @access  Private (Staff only)
 */
router.get('/customers', async (req, res) => {
    try {
        const customers = await Customer.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        const customersWithOrders = await Promise.all(
            customers.map(async (customer) => {
                const orderCount = await Order.countDocuments({ customerId: customer._id });
                return {
                    ...customer.toObject(),
                    orderCount,
                    status: customer.status || 'pending' // Ensure status has a default value
                };
            })
        );
        res.json({ success: true, customers: customersWithOrders });
    } catch (error) {
        logger.error(`Get customers error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error fetching customers', error: error.message });
    }
});

/**
 * @route   GET /api/staff/customers/:id
 * @desc    Get customer details by ID
 * @access  Private (Staff only)
 */
router.get('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-password');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        
        const orders = await Order.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            success: true,
            customer: {
                ...customer.toObject(),
                recentOrders: orders
            }
        });
    } catch (error) {
        logger.error(`Get customer details error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error fetching customer details', error: error.message });
    }
});

/**
 * @route   PUT /api/staff/customers/:id/status
 * @desc    Update customer status
 * @access  Private (Staff only)
 */
router.put('/customers/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({
            success: true,
            message: 'Customer status updated successfully',
            customer
        });
    } catch (error) {
        logger.error(`Update customer status error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error updating customer status', error: error.message });
    }
});

/**
 * @route   GET /api/staff/customers/:id/orders
 * @desc    Get customer orders
 * @access  Private (Staff only)
 */
router.get('/customers/:id/orders', async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        logger.error(`Get customer orders error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error fetching customer orders', error: error.message });
    }
});

/**
 * @route   DELETE /api/staff/customers/:id
 * @desc    Delete customer
 * @access  Private (Staff only)
 */
router.delete('/customers/:id', async (req, res) => {
    try {
        // First, delete all customer's orders
        await Order.deleteMany({ customerId: req.params.id });
        
        // Then delete the customer
        const customer = await Customer.findByIdAndDelete(req.params.id);
        
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }

        res.json({
            success: true,
            message: 'Customer and all associated orders deleted successfully'
        });
    } catch (error) {
        logger.error(`Delete customer error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting customer', 
            error: error.message 
        });
    }
});

/**
 * @route   DELETE /api/staff/orders/:id
 * @desc    Delete order
 * @access  Private (Staff only)
 */
router.delete('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        res.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        logger.error(`Delete order error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting order', 
            error: error.message 
        });
    }
});

module.exports = router;
