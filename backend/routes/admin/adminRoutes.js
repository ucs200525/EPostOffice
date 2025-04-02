const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const Staff = require('../../models/staff/Staff');
const Customer = require('../../models/customer/Customer');
const Transaction = require('../../models/customer/Transaction');
const Order = require('../../models/order/Order'); // Added Order model import
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

router.get('/staff-list', async (req, res) => {
    try {
        const staffMembers = await Staff.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        const staffWithDetails = await Promise.all(
            staffMembers.map(async (staff) => {
                return {
                    ...staff.toObject(),
                    status: staff.status || 'pending',
                    createdAt: staff.createdAt,
                    department: staff.department || 'General',
                    staffId: staff.staffId || staff._id
                };
            })
        );
        res.json({ success: true, staffList: staffWithDetails });
    } catch (error) {
        logger.error(`Get staff list error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error fetching staff list', error: error.message });
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
 * @route   DELETE /api/admin/customers/:id
 * @desc    Delete customer
 * @access  Admin only
 */
router.delete('/customers/:id', adminAuth, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Customer deleted successfully' 
        });
    } catch (error) {
        logger.error(`Delete customer error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/admin/customers/:id
 * @desc    Get customer by ID
 * @access  Admin only
 */
router.get('/customers/:id', adminAuth, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select('-password');
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }
        res.json({ 
            success: true, 
            customer 
        });
    } catch (error) {
        logger.error(`Get customer error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

/**
 * @route   PUT /api/admin/customers/:id
 * @desc    Update customer
 * @access  Admin only
 */
router.put('/customers/:id', adminAuth, async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Customer not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Customer updated successfully',
            customer 
        });
    } catch (error) {
        logger.error(`Update customer error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
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
router.get('/dashboard-stats', adminAuth, async (req, res) => {
    try {
        // For debugging
        console.log('Fetching dashboard stats...');

        // Calculate date range for data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Get last 30 days data

        // Fetch all required data concurrently
        const [orders, customers, staff, transactions] = await Promise.all([
            Order.find({
                createdAt: { $gte: startDate, $lte: endDate }
            }).lean(),
            Customer.countDocuments({ status: 'active' }),
            Staff.countDocuments(),
            Transaction.find({
                createdAt: { $gte: startDate, $lte: endDate }
            }).lean()
        ]);

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + (Number(order.totalAmount) || 0);
        }, 0);

        console.log('Orders found:', orders.length);
        console.log('Total revenue calculated:', totalRevenue);

        // Prepare revenue data for chart
        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    amount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Prepare order data for chart
        const orderData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format response data
        const responseData = {
            success: true,
            totalRevenue,
            activeCustomers: customers,
            totalStaff: staff,
            orders: {
                total: orders.length,
                completed: orders.filter(o => o.status === 'delivered').length,
                pending: orders.filter(o => o.status !== 'delivered').length
            },
            revenueData: revenueData.map(item => ({
                date: item._id,
                amount: parseFloat(item.amount || 0)
            })),
            orderData: orderData.map(item => ({
                date: item._id,
                count: item.count
            }))
        };

        console.log('Dashboard stats response:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
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

/**
 * @route   GET /api/admin/all-users
 * @desc    Get all users (both customers and staff)
 * @access  Admin only
 */
router.get('/all-users', adminAuth, async (req, res) => {
    try {
        // Fetch customers and staff in parallel
        const [customers, staffMembers] = await Promise.all([
            Customer.find().select('-password').lean(),
            Staff.find().select('-password').lean()
        ]);

        // Transform and combine the data
        const allUsers = [
            ...customers.map(customer => ({
                ...customer,
                userType: 'customer',
                status: customer.status || 'active',
                joinDate: customer.createdAt
            })),
            ...staffMembers.map(staff => ({
                ...staff,
                userType: 'staff',
                status: staff.status || 'pending',
                joinDate: staff.createdAt,
                department: staff.department || 'General'
            }))
        ];

        // Sort by join date, newest first
        allUsers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

        res.json({ 
            success: true, 
            users: allUsers,
            counts: {
                total: allUsers.length,
                customers: customers.length,
                staff: staffMembers.length
            }
        });
    } catch (error) {
        logger.error(`Get all users error: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/admin/reports
 * @desc    Generate reports
 * @access  Admin only
 */
router.get('/reports', adminAuth, async (req, res) => {
    try {
        const { range } = req.query;
        const reports = {
            revenue: await getRevenueData(range),
            orders: await getOrdersData(range),
            customers: await getCustomerData(range)
        };
        
        res.json({ success: true, reports });
    } catch (error) {
        logger.error(`Reports error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error generating reports' });
    }
});

/**
 * @route   GET /api/admin/reports/download
 * @desc    Download report as PDF
 * @access  Admin only
 */
router.get('/reports/download', adminAuth, async (req, res) => {
    try {
        const { range } = req.query;
        const reportData = await generatePDFReport(range);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${range}.pdf`);
        res.send(reportData);
    } catch (error) {
        logger.error(`Report download error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Error downloading report' });
    }
});

// Helper functions
async function calculateTotalRevenue() {
    const result = await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    return result[0]?.total || 0;
}

async function getMonthlyRevenue() {
    return await Order.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                amount: { $sum: "$totalAmount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
}

// Helper functions for reports
async function getRevenueData(range) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
        case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }

    return await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalAmount: { $sum: "$totalAmount" }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);
}

async function getOrdersData(range) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
        case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }

    return await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);
}

async function getCustomerData(range) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
        case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }

    return await Customer.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);
}

module.exports = router;
