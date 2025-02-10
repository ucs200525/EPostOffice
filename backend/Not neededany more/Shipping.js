const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
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
  senderAddress: {
    type: String,
    required: true
  },
  receiverAddress: {
    type: String,
    required: true
  },
  destinationCountry: String,
  packageType: {
    type: String,
    enum: ['standard', 'fragile', 'document'],
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  cost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  specialInstructions: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: Date
});

module.exports = mongoose.model('Shipping', shippingSchema);
