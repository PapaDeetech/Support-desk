const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');

    res.status(200).json(users);
});

// @desc    Get all tickets
// @route   GET /api/admin/tickets
// @access  Admin
const getAllTickets = asyncHandler(async (req, res) => {
    const tickets = await Ticket.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(tickets);
});

// @desc    Get any ticket by ID
// @route   GET /api/admin/tickets/:id
// @access  Admin
const getAdminTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate('user', 'name email');

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    res.status(200).json(ticket);
});

// @desc    Update any ticket
// @route   PUT /api/admin/tickets/:id
// @access  Admin
const updateAdminTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    // Only allow fields that the admin is intended to edit.
    const allowedFields = ['product', 'description', 'status'];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.status(200).json(updatedTicket);
});

// @desc    Delete any ticket
// @route   DELETE /api/admin/tickets/:id
// @access  Admin
const deleteAdminTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    await ticket.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully',
    });
});

module.exports = {
    getAllUsers,
    getAllTickets,
    getAdminTicket,
    updateAdminTicket,
    deleteAdminTicket,
};