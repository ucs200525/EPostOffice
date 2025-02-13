const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Make JWT_SECRET available globally
global.JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = process.env.PORT || 4000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('✅ MongoDB Connected'))
    .catch(err => {
        logger.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/customer/authRoutes'));
app.use('/api/customer', require('./routes/customer/customerRoutes'));
app.use('/api/feedback', require('./routes/customer/feedbackRoutes'));

app.use('/api/orders', require('./routes/orders/orderRoutes'));
app.use('/api/user/settings', require('./routes/customer/userSettingsRoutes'));
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/staff', require('./routes/staff/staffRoutes'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error Handling
app.use((err, req, res, next) => {
    logger.error(`❌ Error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  logger.info(`🚀 Server running on http://localhost:${port}`);
});
