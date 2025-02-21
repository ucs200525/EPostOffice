const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true,'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true,'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true,'Password is required'],
        minlength: 6
    },
    firstName: {
        type: String,
        required: [true,'First name is required']
    },
    lastName: {
        type: String,
        required: [true,'Last name is required']
    },
    role: {
        type: String,
        default: 'staff'
    },
    contactNumber: {
        type: String,
        required: [true,'Contact number is required']
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    status: {
        type: String,
        enum: ['active','inactive','suspended'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

staffSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

module.exports = mongoose.model('Staff',staffSchema);
