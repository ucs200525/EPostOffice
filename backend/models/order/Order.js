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
  shippingAddress: {  // Changed from deliveryAddress to shippingAddress
    label: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    type: String,
    isDefault: Boolean,
    _id: mongoose.Schema.Types.ObjectId
  },
  pickupAddress: {
    label: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    type: String,
    isDefault: Boolean,
    _id: mongoose.Schema.Types.ObjectId
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
  customsDeclaration: {
    contents: String,
    value: Number,
    currency: String,
    purpose: String
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
