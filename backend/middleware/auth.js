const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../../models/customer/Customer');
const logger = require('../../utils/logger');
const authenticateToken = require('../../middleware/auth'); // Corrected import

const router = express.Router();

const JWT = process.env.JWT_SECRET || '4278730a297bd11c81de9d180300a0762b72ab2db17c1957bd7e92f4d23a8bf86a31abb506d1801449add58ebf2af3d2c0cb64fabb2059443cf44eafe8701f96b41ac7142d1928330e93c059a7d5c81bb5fc6721d183207bb4a2f0949417940082eef9a8c036a906d10448160b265e9bfa55499d58d1ca52bbfadf4b7c08bacff361045e5ac0ae5f30a0b9f6695bc2e5e2a701bc07bafa0ba2737de080dd826ffc08c983a48251073a82f7986216aec2bab7946cff20e2e7841b92e591bcaa12410d85c564de2b40b5f8499d6a471431b826757d029170d217149193e71858ac4c6bbf11221d4b75b0f92cd867a154e6a9a22a026a3a7e470700e65bd128da2b7c209e6b4c4358d1c422b63ffe2fd3e1a4c84ce2ba03f80d1b45feaf5d60754a';

// Register user (No changes required)
router.post('/register', async (req, res) => { 
  try {
      const { name, email, password, phone, address, coordinates } = req.body;
      const role = 'customer';

      const userExists = await User.findOne({ email });
      if (userExists) {
          logger.warn(`Registration attempt with existing email: ${email}`);
          return res.status(400).json({ message: 'User already exists' });
      }

      let resolvedCoordinates = coordinates;
      if (!coordinates) {
          if (!address) {
              return res.status(400).json({ message: 'Address is required if coordinates are not provided' });
          }

          resolvedCoordinates = await geocodeService.getCoordinatesFromAddress(address);
          if (!resolvedCoordinates) {
              return res.status(400).json({ message: 'Failed to fetch coordinates from address. Please provide a valid address.' });
          }
      }

      const user = await User.create({
          name, email, password, phone, role, address, coordinates: resolvedCoordinates
      });

      const token = jwt.sign({ id: user._id, role: user.role }, JWT, { expiresIn: '1h' });

      logger.info(`New user registered: ${email}`);
      res.status(201).json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role, coordinates: user.coordinates }
      });
  } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token (Modified to debug middleware execution)
router.get('/verify', (req, res, next) => {
  console.log("Executing authentication middleware...");
  authenticateToken(req, res, next);
}, async (req, res) => {
  try {
    console.log("Middleware passed, executing verify route...");
    const customer = await User.findById(req.user.id).select('-password');
    if (!customer) {
      logger.warn(`User not found during verification: ${req.user.id}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    logger.info(`User verified successfully: ${req.user.id}`);
    res.json({ success: true, user: customer, verified: true });
  } catch (error) {
    logger.error(`Verification error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// Login user (No changes required)
router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
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
      res.status(200).json({
          success: true,
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, phone: user.phone }
      });
  } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (Ensure middleware executes)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
          logger.warn(`User not found: ID ${req.user.id}`);
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
  } catch (error) {
      logger.error(`Profile fetch error: ${error.message}`);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
