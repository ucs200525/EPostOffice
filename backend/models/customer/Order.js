const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['domestic', 'international'],
    required: true
  },
  shippingDetails: {
    pickupAddress: {
      streetAddress: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deliveryAddress: {
      streetAddress: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    destinationCountry: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    packageType: {
      type: String,
      enum: ['standard', 'fragile', 'document'],
      default: 'standard'
    },
    specialInstructions: String
  },
  cost: {
    baseRate: Number,
    serviceFee: Number,
    volumeFee: Number,
    total: Number
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'in-transit', 'out-for-delivery', 'delivered', 'failed'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    description: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
