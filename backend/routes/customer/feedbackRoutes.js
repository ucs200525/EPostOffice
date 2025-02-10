const express = require('express');
const router = express.Router();
const Feedback = require('../../models/customer/Feedback');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { feedback, rating, userId } = req.body;
    
    if (!feedback || !rating || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newFeedback = new Feedback({
      userId,
      feedback,
      rating,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting feedback',
      error: error.message 
    });
  }
});

// Get all feedback for admin
router.get('/feedback-forAdmin', async (req, res) => {
    try {
    

        const feedback = await Feedback.find()
            .populate('customerId', 'customerName customerEmail') // Match schema fields
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback' });
    }
});

module.exports = router;
