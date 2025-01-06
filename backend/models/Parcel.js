const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recipient: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true }
    },
    weight: { type: Number, required: true },
    dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    trackingNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate tracking number before saving
parcelSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.trackingNumber = 'TN' + Date.now() + Math.floor(Math.random() * 1000);
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Parcel', parcelSchema);
