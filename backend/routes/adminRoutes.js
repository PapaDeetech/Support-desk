const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');


const {
    getAllUsers,
    getAllTickets,
    getAdminTicket,
    updateAdminTicket,
    deleteAdminTicket,
} = require('../controllers/adminController');

// All routes below require authentication and admin privileges
router.use(protect, adminOnly);

// View all users
router.get('/users', getAllUsers);

// View all tickets
router.get('/tickets', getAllTickets);

// View, update, or delete any ticket
router.route('/tickets/:id')
    .get(getAdminTicket)
    .put(updateAdminTicket)
    .delete(deleteAdminTicket);

// Temporary authorization test
router.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin authorization successful',
    });
});

module.exports = router;