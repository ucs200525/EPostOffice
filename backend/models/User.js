const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
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
        enum: ['admin', 'staff', 'customer'],
        default: 'customer'
    },
    address: { 
        type: String,
        required: function() { return this.role === 'customer' || this.role === 'staff'; }
    },
    coordinates: {
        type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        required: function() { return this.role === 'customer' || this.role === 'staff'; }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// // Pre-save validation for address structure
// userSchema.pre('save', function(next) {
//     if (this.address) {
//         const addressParts = this.address.split(',');
//         const hasValidAddress = addressParts.length >= 4; // Check for area, city, state, and pincode
//         if (!hasValidAddress) {
//             return next(new Error('Address must include area, city, state, and pincode.'));
//         }
//     }
//     next();
// });

module.exports = mongoose.model('User', userSchema);
