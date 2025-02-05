const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// ...existing customer routes...

// Submit feedback
router.post('/feedback', auth, async (req, res) => {
    try {
        const customerId = req.user.id;
        const { rating, feedback } = req.body;

        // Input validation
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

        // Check if customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const newFeedback = new Feedback({
            customerId,
            rating,
            feedback,
            customerName: customer.name,
            customerEmail: customer.email
        });

        await newFeedback.save();

        // Update customer's feedback history
        await Customer.findByIdAndUpdate(customerId, {
            $push: { feedbacks: newFeedback._id }
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
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

// Get customer's feedback history
router.get('/feedback/history', auth, async (req, res) => {
    try {
        const customerId = req.user.id;
        const feedbacks = await Feedback.find({ customerId })
            .sort({ createdAt: -1 })
            .select('-customerEmail'); // Exclude sensitive info

        res.json({
            success: true,
            feedbacks
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching feedback history' 
        });
    }
});

// Update feedback
router.put('/feedback/:feedbackId', auth, async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const { rating, feedback } = req.body;
        const customerId = req.user.id;

        // Find feedback and verify ownership
        const existingFeedback = await Feedback.findOne({
            _id: feedbackId,
            customerId
        });

        if (!existingFeedback) {
            return res.status(404).json({ 
                message: 'Feedback not found or unauthorized' 
            });
        }

        // Validate updates
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ 
                message: 'Rating must be between 1 and 5' 
            });
        }

        if (feedback && (feedback.length < 10 || feedback.length > 500)) {
            return res.status(400).json({ 
                message: 'Feedback must be between 10 and 500 characters' 
            });
        }

        // Update feedback
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { 
                rating: rating || existingFeedback.rating,
                feedback: feedback || existingFeedback.feedback,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Feedback updated successfully',
            feedback: updatedFeedback
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating feedback' 
        });
    }
});

// Delete feedback
router.delete('/feedback/:feedbackId', auth, async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const customerId = req.user.id;

        // Find and verify ownership
        const feedback = await Feedback.findOne({
            _id: feedbackId,
            customerId
        });

        if (!feedback) {
            return res.status(404).json({ 
                message: 'Feedback not found or unauthorized' 
            });
        }

        // Remove feedback
        await Feedback.findByIdAndDelete(feedbackId);

        // Remove reference from customer
        await Customer.findByIdAndUpdate(customerId, {
            $pull: { feedbacks: feedbackId }
        });

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting feedback' 
        });
    }
});

module.exports = router;
