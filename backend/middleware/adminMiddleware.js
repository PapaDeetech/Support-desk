const asyncHandler = require('express-async-handler');

const adminOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    if (req.user.isAdmin !== true) {
        res.status(403);
        throw new Error('Access denied. Admin privileges required.');
    }

    next();
});

module.exports = adminOnly;