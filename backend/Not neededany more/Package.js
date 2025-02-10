const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    recipientName: {
        type: String,
        required: true
    },
    recipientPhone: {
        type: String,
        required: true
    },
    recipientAddress: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    fragile: {
        type: Boolean,
        required: true
    },
    insurance: {
        type: Boolean,
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    estimatedCost: {
        type: Number,
        required: true
    },
    trackingNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'in_transit', 'delivered', 'cancelled'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    trackingHistory: [{
        status: String,
        location: String,
        timestamp: Date,
        description: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
