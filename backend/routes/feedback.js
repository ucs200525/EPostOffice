const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// Submit feedback
router.post('/', auth, async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        // Validation
        if (!rating || !feedback) {
            return res.status(400).json({ message: 'Rating and feedback are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (feedback.length < 10 || feedback.length > 500) {
            return res.status(400).json({ 
                message: 'Feedback must be between 10 and 500 characters' 
            });
        }

        const newFeedback = new Feedback({
            userId: req.user.id,
            rating,
            feedback
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback: newFeedback
        });

    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting feedback' 
        });
    }
});

// Get all feedback for admin
router.get('/admin', auth, async (req, res) => {
    try {
        // Verify if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const feedback = await Feedback.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

module.exports = router;
