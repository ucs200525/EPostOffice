const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/customer/Customer');
const logger = require('../../utils/logger');
const admin = require('firebase-admin');
const router = express.Router();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const JWT = process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
  console.log("JWT missing")
}

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const role = 'customer';

    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      walletBalance: 0,
      pickupAddress: null,
      deliveryAddresses: []
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT, { expiresIn: '1h' });
    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        walletBalance: user.walletBalance,
        pickupAddress: user.pickupAddress,
        deliveryAddresses: user.deliveryAddresses
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: error.errors
    });
  }
});

// Verify route - doesn't require auth middleware
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT);
      const customer = await User.findById(decoded.id)
        .select('-password')
        .populate('pickupAddress')
        .populate('deliveryAddresses');

      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true, 
        user: customer 
      });
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      throw tokenError;
    }
  } catch (error) {
    logger.error(`Verification error: ${error.message}`);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email })
      .populate('pickupAddress')
      .populate('deliveryAddresses');
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password !== password) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT, { expiresIn: '1h' });
    logger.info(`User logged in successfully: ${email}`);

    // Check if customer has any addresses
    const redirectToAddress = user.role === 'customer' && 
      (!user.pickupAddress && (!user.deliveryAddresses || user.deliveryAddresses.length === 0));

    res.status(200).json({
      success: true,
      token,
      redirectToAddress,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        walletBalance: user.walletBalance,
        pickupAddress: user.pickupAddress,
        deliveryAddresses: user.deliveryAddresses
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile route - updated to handle customer ID parameter
router.get('/:customerId/profile', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate if the requesting user has permission to access this profile
    if (req.user && req.user.id !== customerId) {
      logger.warn(`Unauthorized profile access attempt: ${req.user.id} tried to access ${customerId}`);
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const user = await User.findById(customerId)
      .select('-password')
      .populate('pickupAddress')
      .populate('deliveryAddresses')
      .populate('orders');

    if (!user) {
      logger.warn(`User not found: ID ${customerId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        pickupAddress: user.pickupAddress,
        deliveryAddresses: user.deliveryAddresses,
        orders: user.orders
      }
    });
  } catch (error) {
    logger.error(`Profile fetch error: ${error.message}`);
    res.status(500).json({
      message: 'Server error',
      error: error.message || 'An unknown error occurred'
    });
  }
});

// Google authentication route
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Google ID are required' 
      });
    }

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0], // Use name from Google or create from email
        email,
        password: googleId, // Using Google ID as password
        phone: "0000000000", // Default phone number
        role: 'customer',
        walletBalance: 0,
        pickupAddress: null,
        deliveryAddresses: []
      });
      logger.info(`New user registered via Google: ${email}`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in via Google: ${email}`);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        walletBalance: user.walletBalance,
        pickupAddress: user.pickupAddress,
        deliveryAddresses: user.deliveryAddresses
      }
    });
  } catch (error) {
    logger.error(`Google authentication error: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Google authentication failed',
      error: error.message 
    });
  }
});

module.exports = router;
