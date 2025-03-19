require('dotenv').config();  // Load environment variables at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

// Import routes with try-catch fallback
let adminRoutes, staffRoutes, notificationRoutes;
try {
    adminRoutes = require('./routes/admin/adminRoutes');
} catch (e) {
    adminRoutes = express.Router();
}

try {
    staffRoutes = require('./routes/staff/staffRoutes');
} catch (e) {
    staffRoutes = express.Router();
}

try {
    notificationRoutes = require('./routes/customer/notificationRoutes');
} catch (e) {
    notificationRoutes = express.Router();
}

// Other routes
const customerRoutes = require('./routes/customer/customerRoutes');
const authRoutes = require('./routes/customer/authRoutes');
const orderRoutes = require('./routes/order/orderRoutes');
const packageRoutes = require('./routes/order/packageRoutes');
const shipmentRoutes = require('./routes/order/shipmentRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

// Initialize express app
const app = express();

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables');
    process.exit(1);
}

// Security Middleware
app.use(helmet());

const allowedOrigins = [
    'http://localhost:3000',
    'https://e-post-office.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('📦 Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/customer/notifications', notificationRoutes);
app.use('/api/shipments', shipmentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handling Middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = server;
