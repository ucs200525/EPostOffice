const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order_update', 'payment', 'system', 'other'],
        default: 'other'
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);