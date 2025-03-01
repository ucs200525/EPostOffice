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
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    addressType: {
        type: String,
        enum: ['pickup', 'delivery'],
        required: true
    }
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

module.exports = mongoose.model('Address', addressSchema);