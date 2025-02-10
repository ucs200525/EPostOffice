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
    senderAddress: String,
    receiverAddress: String,
    destinationCountry: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    packageType: String
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
