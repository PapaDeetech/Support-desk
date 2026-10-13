const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }

    try {
        // Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            res.status(401);
            throw new Error('Not authorized, user not found');
        }

        req.user = user;

        return next();
    } catch (error) {
        // Preserve errors intentionally thrown above
        if (error.statusCode === 401) {
            throw error;
        }

        console.error('Authentication error:', error.message);

        res.status(401);
        throw new Error('Not authorized, invalid or expired token');
    }
});

module.exports = { protect };