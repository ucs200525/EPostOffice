const mongoose = require('mongoose');

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
    walletBalance: {
        type: Number,
        default: 0
    },
    address: String,
    phone: String,
    role: {
        type: String,
        default: 'customer'
    },
    addresses: [{
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
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
}, { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Method to update wallet balance
customerSchema.methods.updateWalletBalance = async function(amount) {
    this.walletBalance += amount;
    return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
