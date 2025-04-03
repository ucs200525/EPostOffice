const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  pickupAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  packageDetails: {
    type: {
      type: String,
      enum: [
        'basic_letter', 'standard_parcel', 'express_parcel', 'premium_parcel', 'bulk_shipment', // Domestic
        'basic_intl', 'standard_intl', 'express_intl', 'premium_intl', 'bulk_intl' // International
      ],
      required: true
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    specialInstructions: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'package_picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['domestic', 'international'],
    required: true
  },
  cost: {
    basePrice: Number,
    weightCharge: Number,
    insuranceCharge: Number,
    internationalCharge: Number,
    total: Number
  },
  estimatedDeliveryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
