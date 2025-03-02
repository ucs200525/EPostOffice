const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pickup', 'delivery'],
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    coordinates: {
        lat: Number,
        lng: Number
    }
});

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'delivery', 'system', 'promotional'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'customer'
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    pickupAddress: addressSchema,
    deliveryAddresses: [addressSchema],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: true
        },
        orderUpdates: {
            type: Boolean,
            default: true
        },
        promotionalEmails: {
            type: Boolean,
            default: false
        }
    },
    notifications: [notificationSchema]
}, {
    timestamps: true
});

// Add method to update wallet balance
customerSchema.methods.updateWalletBalance = async function(amount) {
    this.walletBalance += amount;
    return this.save();
};

// Remove the separate Address model import and just export the Customer model
module.exports = mongoose.model('Customer', customerSchema);
