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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Package', packageSchema);
