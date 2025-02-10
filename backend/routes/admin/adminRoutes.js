const express = require('express');
const router = express.Router();
const Admin = require('../../models/admin/admin');
const jwt = require('jsonwebtoken');
// const auth = require('../../middleware/auth');
const Customer = require('../../models/customer/Customer');
const Staff = require('../../models/staff/Staff');
const Order = require('../../Not neededany more/Shipping');
const Transaction = require('../../models/customer/Transaction');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                username: admin.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Admin Profile
router.get('/profile',  async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Admin Profile
router.put('/profile' , async (req, res) => {
    try {
        const { username, email } = req.body;
        const admin = await Admin.findById(req.user.id);
        
        if (username) admin.username = username;
        if (email) admin.email = email;
        
        await admin.save();
        res.json({ message: 'Profile updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Change Password
router.put('/change-password',   async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.user.id);

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        admin.password = newPassword;
        await admin.save();
        
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Dashboard Stats
router.get('/dashboard-stats',   async (req, res) => {
  try {
    // Get counts
    const totalStaff = await Staff.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Calculate revenue
    const transactions = await Transaction.find({
      createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthRevenue = transactions
      .filter(t => t.createdAt.getMonth() === new Date().getMonth() - 1)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyGrowth = lastMonthRevenue ? 
      ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalStaff,
        activeCustomers,
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        monthlyGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

module.exports = router;
