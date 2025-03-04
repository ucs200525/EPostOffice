const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
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
      enum: ['standard', 'fragile', 'document'],
      default: 'standard'
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
    enum: ['pending', 'confirmed', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['domestic', 'international'],
    required: true
  },
  totalAmount: {
    type: Number,
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
