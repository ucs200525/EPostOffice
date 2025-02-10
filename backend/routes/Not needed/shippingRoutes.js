const express = require('express');
const router = express.Router();
const Shipping = require('../../Not neededany more/Shipping');
const Customer = require('../../models/customer/Customer');
const auth = require('../../middleware/auth');

// Calculate shipping cost
router.post('/calculate', (req, res) => {
  try {
    const { weight, dimensions, packageType, destinationCountry } = req.body;

    // Base rate calculation
    const baseRate = weight * 10; // $10 per kg
    const volumeCharge = (dimensions.length * dimensions.width * dimensions.height) * 0.001;

    // Package type multipliers
    const typeMultipliers = {
      'standard': 1.0,
      'fragile': 1.5,
      'document': 0.8
    };

    // Distance/country multiplier
    const distanceMultiplier = destinationCountry ? 2.5 : 1;

    // Calculate costs
    const baseCost = (baseRate + volumeCharge) * typeMultipliers[packageType] * distanceMultiplier;
    const serviceFee = baseCost * 0.2;
    const totalCost = baseCost + serviceFee;

    res.json({
      success: true,
      cost: {
        baseRate: Math.round(baseCost * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        total: Math.round(totalCost * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating shipping cost',
      error: error.message 
    });
  }
});

// Create new shipping order
router.post('/create', auth, async (req, res) => {
  try {
    const { userId, cost, ...shippingDetails } = req.body;

    // Verify customer and balance
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    if (customer.walletBalance < cost) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Create shipping order
    const shipping = new Shipping({
      ...shippingDetails,
      userId,
      cost,
      status: 'pending',
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery: calculateEstimatedDelivery(shippingDetails.destinationCountry)
    });

    await shipping.save();

    // Deduct payment from wallet
    await customer.updateWalletBalance(-cost);

    res.status(201).json({
      success: true,
      trackingNumber: shipping.trackingNumber,
      estimatedDelivery: shipping.estimatedDelivery
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating shipping order', error: error.message });
  }
});

// Get shipping details by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('userId', 'name email');

    if (!shipping) {
      return res.status(404).json({ message: 'Shipping order not found' });
    }

    res.json({ success: true, shipping });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking shipment', error: error.message });
  }
});

// Get all shipments for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const shipments = await Shipping.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, shipments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shipments', error: error.message });
  }
});

// Cancel shipping order
router.post('/cancel/:trackingNumber', auth, async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ trackingNumber: req.params.trackingNumber });
    
    if (!shipping) {
      return res.status(404).json({ message: 'Shipping order not found' });
    }

    if (shipping.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel shipment in current status' });
    }

    // Refund to wallet
    const customer = await Customer.findById(shipping.userId);
    await customer.updateWalletBalance(shipping.cost);

    shipping.status = 'cancelled';
    await shipping.save();

    res.json({ 
      success: true, 
      message: 'Shipping cancelled and refunded',
      newBalance: customer.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling shipment', error: error.message });
  }
});

// Helper Functions
function generateTrackingNumber() {
  return 'EP' + Date.now().toString(36).toUpperCase() + 
         Math.random().toString(36).substring(2, 7).toUpperCase();
}

function calculateEstimatedDelivery(isInternational) {
  const now = new Date();
  // Add 3 days for domestic, 7 days for international
  const daysToAdd = isInternational ? 7 : 3;
  return new Date(now.setDate(now.getDate() + daysToAdd));
}

module.exports = router;
