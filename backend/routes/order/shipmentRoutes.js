const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order'); // Changed to use Order model
const Customer = require('../../models/customer/Customer');
const { auth } = require('../../middleware/auth');
const { generateTrackingNumber } = require('../../utils/shipmentUtils');

// Create new order
router.post('/create', auth, async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('User from auth:', req.user); // Debug log

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const {
      pickupAddress,
      deliveryAddress,
      packageType,
      weight,
      dimensions,
      specialInstructions,
      customsDeclaration
    } = req.body;

    if (!pickupAddress || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and delivery addresses are required'
      });
    }

    // Calculate total amount
    const basePrice = 50;
    const weightCharge = weight * 10;
    const insuranceCharge = customsDeclaration ? customsDeclaration.value * 0.01 : 0;
    const internationalCharge = customsDeclaration ? 100 : 0;
    const totalAmount = basePrice + weightCharge + insuranceCharge + internationalCharge;

    const trackingNumber = generateTrackingNumber();

    const order = new Order({
      customerId: req.user.id, // Use req.user.id instead of req.user._id
      trackingNumber,
      shippingAddress: deliveryAddress, // Changed to match schema
      pickupAddress,
      packageDetails: {
        type: packageType || 'standard',
        weight,
        dimensions,
        specialInstructions
      },
      customsDeclaration,
      status: 'pending',
      orderType: customsDeclaration ? 'international' : 'domestic',
      totalAmount, // Added required field
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      cost: {
        basePrice: 50,
        weightCharge: weight * 10,
        insuranceCharge: customsDeclaration ? customsDeclaration.value * 0.01 : 0,
        internationalCharge: customsDeclaration ? 100 : 0,
        total: totalAmount
      }
    });

    console.log('Order object before save:', order); // Debug log

    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder); // Debug log

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      trackingNumber: savedOrder.trackingNumber,
      orderId: savedOrder._id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message // Include error message for debugging
    });
  }
});

// Verify order
router.get('/verify/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await Order.findOne({ trackingNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Order verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying order'
    });
  }
});

// Calculate shipping cost
router.post('/calculate-cost', async (req, res) => {
  try {
    const { weight, packageType, customsDeclaration, type } = req.body;

    const basePrice = 50;
    const weightPrice = weight * 10;
    const insurancePrice = customsDeclaration?.value * 0.01 || 0;
    const internationalSurcharge = type === 'international' ? 100 : 0;

    const total = basePrice + weightPrice + insurancePrice + internationalSurcharge;

    res.json({
      success: true,
      cost: {
        basePrice,
        weightPrice,
        insurancePrice,
        internationalSurcharge,
        total
      }
    });
  } catch (error) {
    console.error('Cost calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating shipping cost'
    });
  }
});

// Get user's orders - Fixed route with proper auth check
router.get('/user/:userId/orders', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching orders for userId:', userId); // Debug log

    // Verify user has access
    if (!userId || !req.user || req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to orders'
      });
    }

    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders); // Debug log

    const stats = {
      active: orders.filter(order => order.status === 'pending').length,
      transit: orders.filter(order => order.status === 'in-transit').length,
      completed: orders.filter(order => order.status === 'delivered').length,
      total: orders.length
    };

    res.json({
      success: true,
      data: orders,
      stats
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get customer's orders - Fixed route with auth
router.get('/my-orders', auth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user.id); // Debug log

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const orders = await Order.find({ 
      customerId: req.user.id 
    }).sort({ createdAt: -1 });

    console.log('Found orders:', orders); // Debug log

    // Calculate order statistics
    const stats = {
      active: orders.filter(order => order.status === 'pending').length,
      transit: orders.filter(order => order.status === 'in-transit').length,
      completed: orders.filter(order => order.status === 'delivered').length,
      total: orders.length
    };

    res.json({
      success: true,
      data: orders,
      stats
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Track order
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const order = await Order.findOne({ trackingNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      tracking: {
        status: order.status,
        currentLocation: order.currentLocation,
        history: order.trackingHistory,
        estimatedDelivery: order.estimatedDeliveryDate
      }
    });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order'
    });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customerId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

module.exports = router;
