require('dotenv').config();  // Load environment variables at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

// Import routes with fallbacks
const customerRoutes = require('./routes/customer/customerRoutes');
const authRoutes = require('./routes/customer/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes') || express.Router();
const staffRoutes = require('./routes/staff/staffRoutes') || express.Router();
const orderRoutes = require('./routes/order/orderRoutes');
const packageRoutes = require('./routes/order/packageRoutes');
const notificationRoutes = require('./routes/customer/notificationRoutes') || express.Router();
const shipmentRoutes = require('./routes/order/shipmentRoutes');
const paymentRoutes = require('./routes/customer/paymentRoutes'); // Import payment routes

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

// Initialize express app
const app = express();

// Check for JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables');
    process.exit(1);
}

// Security Middleware
app.use(helmet());
const allowedOrigins = [
    'http://localhost:3000',  // Your frontend URL (change accordingly)
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

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => console.log('📦 Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google-login', authRoutes); // Add this line
app.use('/api/customer', customerRoutes);
app.use('/api/customer', paymentRoutes); // Register payment routes
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/customer/notifications', notificationRoutes);
app.use('/api/orders/user/:userId/shipments', orderRoutes);
app.use('/api/shipments', shipmentRoutes);

// 404 handler should be after all routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handling Middleware
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(errorHandler);

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Export the app instead of the server
module.exports = app;
