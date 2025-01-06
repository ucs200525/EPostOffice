const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Parcel = require('../models/Parcel');
const Feedback = require('../models/Feedback');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create new parcel
router.post('/parcels', authenticateToken, async (req, res) => {
    try {
        const parcel = new Parcel({
            sender: req.user.id,
            ...req.body
        });
        await parcel.save();
        
        logger.info(`New parcel created: ${parcel.trackingNumber}`);
        res.status(201).json(parcel);
    } catch (error) {
        logger.error(`Parcel creation error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// Get customer's parcels
router.get('/parcels', authenticateToken, async (req, res) => {
    try {
        const parcels = await Parcel.find({ sender: req.user.id })
                                  .populate('assignedTo', 'name');
        res.json(parcels);
    } catch (error) {
        logger.error(`Error fetching parcels: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// Submit feedback
router.post('/feedback', authenticateToken, async (req, res) => {
    try {
        const feedback = new Feedback({
            customer: req.user.id,
            ...req.body
        });
        await feedback.save();
        
        logger.info(`New feedback submitted by user: ${req.user.id}`);
        res.status(201).json(feedback);
    } catch (error) {
        logger.error(`Feedback submission error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// ...additional routes as needed...

module.exports = router;
