const express = require('express');
const router = express.Router();
const Order = require('../../models/customer/Order');
const Customer = require('../../models/customer/Customer'); // Add this import
const jwt = require('jsonwebtoken'); // Add this import at the top

const RATES = {
  domestic: {
    baseRate: 10, // Rs. per kg
    serviceFee: 50,
    volumetricFactor: 5000 // Volumetric weight divisor
  },
  international: {
    baseRate: 50, // Rs. per kg
    serviceFee: 500,
    volumetricFactor: 6000,
    zonalRates: {
      'USA': 2.5,
      'UK': 2.0,
      'Europe': 2.2,
      'Asia': 1.5,
      'Others': 2.0
    }
  }
};

// Create new order with shipping details
router.post('/create', async (req, res) => {
  try {
    console.log('Received order data:', req.body); // Debug log

    const { userId, shippingDetails, cost } = req.body;

    // Detailed validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate shipping details structure
    if (!shippingDetails || 
        !shippingDetails.pickupAddress || 
        !shippingDetails.deliveryAddress ||
        !shippingDetails.weight ||
        !shippingDetails.dimensions ||
        !shippingDetails.packageType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required shipping details',
        required: [
          'pickupAddress',
          'deliveryAddress',
          'weight',
          'dimensions',
          'packageType'
        ],
        received: Object.keys(shippingDetails || {})
      });
    }

    // Find customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const trackingNumber = generateTrackingNumber();

    // Create new order with proper structure
    const order = await Order.create({
      userId,
      trackingNumber,
      type: shippingDetails.destinationCountry ? 'international' : 'domestic',
      shippingDetails: {
        pickupAddress: {
          streetAddress: shippingDetails.pickupAddress.streetAddress,
          city: shippingDetails.pickupAddress.city,
          state: shippingDetails.pickupAddress.state,
          postalCode: shippingDetails.pickupAddress.postalCode,
          country: shippingDetails.pickupAddress.country || 'India'
        },
        deliveryAddress: {
          streetAddress: shippingDetails.deliveryAddress.streetAddress,
          city: shippingDetails.deliveryAddress.city,
          state: shippingDetails.deliveryAddress.state,
          postalCode: shippingDetails.deliveryAddress.postalCode,
          country: shippingDetails.deliveryAddress.country,
          coordinates: shippingDetails.deliveryAddress.coordinates
        },
        weight: parseFloat(shippingDetails.weight),
        dimensions: {
          length: parseFloat(shippingDetails.dimensions.length),
          width: parseFloat(shippingDetails.dimensions.width),
          height: parseFloat(shippingDetails.dimensions.height)
        },
        packageType: shippingDetails.packageType,
        specialInstructions: shippingDetails.specialInstructions || '',
        destinationCountry: shippingDetails.destinationCountry || 'India'
      },
      status: 'pending',
      timeline: [{
        status: 'pending',
        description: 'Order created and pending payment',
        timestamp: new Date()
      }]
    });

    // Update customer's order history
    if (!customer.orders) {
      customer.orders = [];
    }
    customer.orders.push(order._id);
    await customer.save();

    console.log('Order created successfully:', order); // Debug log

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      trackingNumber,
      orderId: order._id
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.stack 
    });
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
    // First try to get userId from query params
    let userId = req.query.userId;
    
    // If no userId in query, extract from JWT token
    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      console.log('Extracted userId from token:', userId);
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required either as query parameter or in authorization token',
      });
    }

    // Verify if the customer exists
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = await Order.find({ userId })
      .select('trackingNumber type shippingDetails status createdAt')
      .lean()
      .exec();

    const formattedOrders = orders.map(order => ({
      ...order,
      shippingDetails: {
        pickupAddress: order.shippingDetails?.pickupAddress || {
          city: 'N/A',
          state: 'N/A'
        },
        deliveryAddress: order.shippingDetails?.deliveryAddress || {
          city: 'N/A',
          state: 'N/A'
        },
        weight: order.shippingDetails?.weight || 0,
        dimensions: order.shippingDetails?.dimensions || {
          length: 0,
          width: 0,
          height: 0
        }
      },
      status: order.status || 'pending',
      type: order.type || 'domestic'
    }));

    console.log('Formatted orders:', formattedOrders); // Debug log

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        stats: calculateOrderStats(orders),
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Error in /my-orders route:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.stack
    });
  }
});

// Helper function to calculate order stats
function calculateOrderStats(orders) {
  return orders.reduce((acc, order) => {
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
}

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
    const {
      weight,
      dimensions,
      type = 'domestic',
      destinationCountry,
      packageType
    } = req.body;

    // Validate input
    if (!weight || !dimensions) {
      return res.status(400).json({
        success: false,
        message: 'Weight and dimensions are required'
      });
    }

    if (type === 'international' && !destinationCountry) {
      return res.status(400).json({
        success: false,
        message: 'Destination country is required for international shipping'
      });
    }

    // Calculate volumetric weight
    const volumetricWeight = (
      (dimensions.length * dimensions.width * dimensions.height) / 
      RATES[type].volumetricFactor
    );

    // Use the greater of actual weight and volumetric weight
    const chargeableWeight = Math.max(weight, volumetricWeight);

    // Calculate base cost
    let baseCost = chargeableWeight * RATES[type].baseRate;
    
    // Add international multiplier if applicable
    if (type === 'international') {
      const zoneRate = RATES.international.zonalRates[destinationCountry] || 
                      RATES.international.zonalRates.Others;
      baseCost *= zoneRate;
    }

    // Add service fee
    const serviceFee = RATES[type].serviceFee;

    // Add package type surcharge
    let packageTypeSurcharge = 0;
    if (packageType === 'fragile') {
      packageTypeSurcharge = type === 'international' ? 200 : 100;
    }

    // Calculate total
    const total = baseCost + serviceFee + packageTypeSurcharge;

    // Return cost breakdown
    res.json({
      success: true,
      calculation: {
        chargeableWeight,
        volumetricWeight,
        actualWeight: weight,
        baseCost,
        serviceFee,
        packageTypeSurcharge,
        total: Math.ceil(total), // Round up to nearest rupee
        breakdown: {
          dimensions: `${dimensions.length}x${dimensions.width}x${dimensions.height}cm`,
          type,
          destinationCountry: destinationCountry || 'India'
        }
      }
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating shipping cost',
      error: error.message
    });
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
