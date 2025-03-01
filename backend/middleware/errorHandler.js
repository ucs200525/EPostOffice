const ErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        });
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        err.statusCode = 400;
        err.message = Object.values(err.errors)
            .map(val => val.message)
            .join(', ');
    }

    if (err.code === 11000) {
        err.statusCode = 400;
        err.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field`;
    }

    if (err.name === 'JsonWebTokenError') {
        err.statusCode = 401;
        err.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        err.statusCode = 401;
        err.message = 'Token expired';
    }

    // Send error response
    res.status(err.statusCode).json({
        success: false,
        error: {
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err.details || undefined
            })
        }
    });
};

module.exports = ErrorHandler;
