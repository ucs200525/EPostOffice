const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        logger.warn('Access attempt without token');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        logger.error(`Token verification failed: ${err.message}`);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
