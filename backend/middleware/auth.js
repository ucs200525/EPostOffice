const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Access attempt without token');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
