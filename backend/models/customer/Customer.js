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
    phone: String,
    role: {
        type: String,
        default: 'customer'
    },
    pickupAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    deliveryAddresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
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
