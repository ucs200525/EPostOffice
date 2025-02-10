const express = require('express');
const router = express.Router();
const Order = require('../../models/customer/Order');

// Create new order
router.post('/create', async (req, res) => {
  try {
    const { userId, shippingDetails, cost } = req.body;
    const trackingNumber = generateTrackingNumber();

    const order = await Order.create({
      userId,
      trackingNumber,
      type: shippingDetails?.destinationCountry ? 'international' : 'domestic',
      shippingDetails,
      cost,
      status: 'pending',
      timeline: [{
        status: 'pending',
        description: 'Order created',
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      trackingNumber,
      orderId: order._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track order
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', async (req, res) => {
  try {
    // Get userId from request body or token since middleware is removed
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    const stats = orders.reduce((acc, order) => {
      acc.total++;
      switch (order.status) {
        case 'pending':
        case 'processing':
          acc.active++;
          break;
        case 'in-transit':
        case 'out-for-delivery':
          acc.transit++;
          break;
        case 'delivered':
          acc.completed++;
          break;
      }
      return acc;
    }, { active: 0, transit: 0, completed: 0, total: 0 });

    res.json({
      success: true,
      orders,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.patch('/status/:orderId', async (req, res) => {
  try {
    const { status, description, location } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.timeline.push({
      status,
      description,
      location,
      timestamp: new Date()
    });

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate shipping cost
router.post('/calculate', async (req, res) => {
  try {
    const { weight, dimensions, type, destinationCountry } = req.body;
    const cost = calculateShippingCost(weight, dimensions, type, destinationCountry);
    res.json({ success: true, cost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to generate tracking number
function generateTrackingNumber() {
  const prefix = 'EP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}${timestamp}`;
}

// Helper function to calculate shipping cost
function calculateShippingCost(weight, dimensions, type, destinationCountry) {
  const baseRate = weight * 10;
  const serviceFee = destinationCountry ? 20 : 10;
  const volumeFee = (dimensions.length * dimensions.width * dimensions.height) / 5000;
  
  return {
    baseRate,
    serviceFee,
    volumeFee,
    total: baseRate + serviceFee + volumeFee
  };
}

module.exports = router;
