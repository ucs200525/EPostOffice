const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer/Customer');
const logger = require('../../utils/logger');
const admin = require('firebase-admin');

// Google login route
router.post('/google-login', async (req, res) => {
    try {
        const { email, displayName, photoURL, googleId	 } = req.body;

        if (!email || !googleId	) {
            return res.status(400).json({
                success: false,
                message: 'Email and UID are required'
            });
        }

        // Find or create user
        let customer = await Customer.findOne({ email });
        
        if (!customer) {
            customer = await Customer.create({
                name: displayName || email.split('@')[0],
                email,
                password: uid, // Using Firebase UID as password
                role: 'customer',
                photoURL
            });
            logger.info(`New customer registered via Google: ${email}`);
        }

        const token = jwt.sign(
            { id: customer._id, role: customer.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        logger.info(`Customer logged in via Google: ${email}`);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                role: customer.role,
                photoURL: customer.photoURL,
                walletBalance: customer.walletBalance || 0
            }
        });
    } catch (error) {
        logger.error(`Google login error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Google login failed',
            error: error.message
        });
    }
});

module.exports = router;