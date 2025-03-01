const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    street: {
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
    isPickupAddress: {
        type: Boolean,
        default: false
    },
    coordinates: {
        lat: Number,
        lng: Number
    }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
module.exports.addressSchema = addressSchema;