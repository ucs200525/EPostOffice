const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    role: {
        type: String,
        enum: ['customer', 'staff', 'admin'],
        default: 'customer'
    },
    phone: String,
    address: String,
    staffId: {
        type: String,
        sparse: true // Only enforces uniqueness if field exists
    },
    department: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
