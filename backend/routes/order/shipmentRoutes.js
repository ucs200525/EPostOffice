const express = require('express');
const router = express.Router();
const Order = require('../../models/order/Order');
const Customer = require('../../models/customer/Customer');
const { auth } = require('../../middleware/auth');
const { generateTrackingNumber } = require('../../utils/shipmentUtils');
const { validatePackageDetails, PACKAGE_PRICING } = require('../../middleware/orderValidation');

// Create new order - Add validatePackageDetails middleware
router.post('/create', auth, validatePackageDetails, async (req, res) => {
  try {
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
      customsDeclaration,
      totalAmount
    } = req.body;

    // Check wallet balance first
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.walletBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Wallet balance (₹${customer.walletBalance}) is less than order total (₹${totalAmount})`
      });
    }

    if (!pickupAddress || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and delivery addresses are required'
      });
    }

    const { packagePricing, orderType } = req;
    const { calculatedCosts } = packagePricing;

    const trackingNumber = generateTrackingNumber();

    const order = new Order({
      customerId: req.user.id,
      trackingNumber,
      shippingAddress: deliveryAddress,
      pickupAddress,
      packageDetails: {
        type: packageType,
        weight: parseFloat(weight),
        dimensions,
        specialInstructions
      },
      customsDeclaration,
      status: 'pending',
      orderType,
      totalAmount: calculatedCosts.total,
      estimatedDeliveryDate: new Date(Date.now() + (orderType === 'international' ? 7 : 3) * 24 * 60 * 60 * 1000),
      cost: {
        basePrice: calculatedCosts.basePrice,
        weightCharge: calculatedCosts.weightCharge,
        volumeCharge: calculatedCosts.volumeCharge,
        insuranceCharge: calculatedCosts.insuranceCharge,
        internationalCharge: calculatedCosts.internationalCharge,
        total: calculatedCosts.total
      }
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      trackingNumber: savedOrder.trackingNumber,
      orderId: savedOrder._id,
      estimatedDelivery: savedOrder.estimatedDeliveryDate,
      cost: savedOrder.cost
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
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

// Calculate shipping cost - Add validatePackageDetails middleware
router.post('/calculate-cost', validatePackageDetails, async (req, res) => {
  try {
    const { packagePricing } = req;

    res.json({
      success: true,
      cost: packagePricing.calculatedCosts,
      details: {
        maxWeight: packagePricing.maxWeight,
        orderType: req.orderType
      }
    });
  } catch (error) {
    console.error('Cost calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating shipping cost',
      error: error.message
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
