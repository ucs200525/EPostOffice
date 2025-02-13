const express = require('express');
const router = express.Router();
// const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/register-staff', async (req, res) => {
  try {
    // Verify that the requestor is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to register staff' });
    }

    const { name, email, password, phone, address, staffId, department } = req.body;

    // Check if staff with same email or staffId already exists
    const existingStaff = await User.findOne({ 
      $or: [{ email }, { staffId }]
    });

    if (existingStaff) {
      return res.status(400).json({ 
        message: 'Staff member with this email or ID already exists' 
      });
    }

    // Create new staff member
    const staff = new User({
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

// Get all staff members
router.get('/staff-list', async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view staff list' });
    }

    // Fetch all users with role 'staff'
    const staffList = await User.find({ role: 'staff' })
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 }); // Sort by newest first

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
