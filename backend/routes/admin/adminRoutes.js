const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const Customer = require('../../models/customer/Customer');
const Order = require('../../Not neededany more/Shipping');
const Transaction = require('../../models/customer/Transaction');
const User = require('../../models/User');
const mongoose = require('mongoose');

// Staff Schema (added directly in the route file since we're not creating a new model)
const staffSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    address: String,
    phone: String,
    role: { 
        type: String, 
        default: 'staff' 
    },
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    }
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const Staff = mongoose.model('Staff', staffSchema);

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
router.get('/profile', auth, async (req, res) => {
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
router.put('/profile', auth, async (req, res) => {
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
router.put('/change-password', auth, async (req, res) => {
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
router.get('/dashboard-stats', auth, async (req, res) => {
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

// Register staff member
router.post('/register-staff', auth, async (req, res) => {
  try {
    const { name, email, password, phone, address, staffId, department } = req.body;

    // Check for existing staff
    const existingStaff = await Staff.findOne({ 
      $or: [{ email }, { staffId }] 
    });

    if (existingStaff) {
      return res.status(400).json({ 
        message: 'Staff member with this email or ID already exists' 
      });
    }

    // Create new staff member
    const staff = new Staff({
      name,
      email,
      password,
      phone,
      address,
      staffId,
      department,
      role: 'staff'
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: 'Staff member registered successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering staff member', 
      error: error.message 
    });
  }
});

// Get staff list
router.get('/staff-list', auth, async (req, res) => {
  try {
    const staffList = await Staff.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      staffList
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching staff list',
      error: error.message
    });
  }
});

module.exports = router;
