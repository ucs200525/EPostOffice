const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Import routes with fallbacks
const customerRoutes = require('./routes/customer/customerRoutes');
const authRoutes = require('./routes/customer/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes') || express.Router();
const staffRoutes = require('./routes/staff/staffRoutes') || express.Router();
const orderRoutes = require('./routes/order/orderRoutes') || express.Router();

// Import middleware with fallback
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth') || ((req, res, next) => next());

// Initialize express app
const app = express();
dotenv.config();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

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

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', auth, customerRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/staff', auth, staffRoutes);
app.use('/api/orders', auth, orderRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
    });
}

// Error Handling Middleware
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error('Error:', err);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

module.exports = server;
