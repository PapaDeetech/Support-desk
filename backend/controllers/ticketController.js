const asyncHandler = require("express-async-handler");

const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

// @desc Get user tickets
// @route GET /api/tickets
// @access Private
const getTickets = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const tickets = await Ticket.find({user: req.user.id})
  res.status(200).json(tickets);
});

// @desc Get user ticket
// @route GET /api/tickets/:id
// @access Private
const getTicket = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.id)

  if(!ticket){
    res.status(404)
    throw new Error('Ticket not found')
  }

  if(ticket.user.toString() !== req.user.id){
    res.status(401)
    throw new Error('Not Authorized')
  }

  res.status(200).json(ticket);
});


// @desc Delete a ticket
// @route DELETE /api/tickets/:id
// @access Private
const deleteTicket = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.id)

  if(!ticket){
    res.status(404);
    throw new Error('Ticket not found')
  }

  if(ticket.user.toString() !== req.user.id){
    res.status(401);
    throw new Error('Not Authorized')
  }

//   await ticket.remove()
    await Ticket.findByIdAndDelete(req.params.id)

  res.status(200).json({success: true});
});

// @desc update a ticket
// @route PUT /api/tickets/:id
// @access Private
const updateTicket = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.id)

  if(!ticket){
    res.status(404)
    throw new Error('Ticket not found')
  }

  if(ticket.user.toString() !== req.user.id){
    res.status(401)
    throw new Error('Not Authorized')
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {new:true})

  res.status(200).json(updatedTicket);
});

// @desc Like or unlike a ticket
// @route PUT /api/tickets/:id/like
// @access Private
const likeTicket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // find the tcicket by id
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Get the user who likes the ticket
  const userId = user._id.toString();

  const likes = ticket.likes || [];

  // Check if the user has already liked the ticket
  const alreadyLiked = likes.some((like) => like.toString() === userId);

  if (alreadyLiked) {
    // If the user has already liked the ticket, remove their like
    ticket.likes = likes.filter((like) => like.toString() !== userId);
  } else {
    // If the user hasn't liked the ticket yet, add their like
    ticket.likes.push(userId);
  }

  // Save the updated ticket
  await ticket.save();

  // Return the updated likes array
  res.status(200).json({
    _id: ticket._id,
    likes: ticket.likes,
    likesCount: ticket.likes.length,
  });
})

// @desc Submit a review for a closed ticket
 // @route POST /api/tickets/:id/review
 // @access Private
  const submitTicketReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const user = await User.findById(req.user.id)

  if (!user) {
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.id)

  if (!ticket) {
    res.status(404)
    throw new Error('Ticket not found')
  }

  if (ticket.user.toString() !== req.user.id.toString()) {
    res.status(403)
    throw new Error('Not authorized to review this ticket')
  }

  // Match this condition to the status used by your app.
  if (ticket.status !== 'closed') {
    res.status(400)
    throw new Error('You can only review a closed ticket')
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400)
    throw new Error('Rating must be a whole number from 1 to 5')
  }

  if (ticket.review?.rating) {
    res.status(400)
    throw new Error('This ticket has already been reviewed')
  }

  ticket.review = {
    rating,
    comment: typeof comment === 'string' ? comment.trim() : '',
    reviewedBy: user._id,
    reviewedAt: new Date(),
  }

  await ticket.save()

  res.status(201).json(ticket.review)
})

// @desc Create new ticket
// @route POST /api/tickets
// @access Private
const createTicket = asyncHandler(async (req, res) => {
  const { product, description } = req.body;

  if (!product || !description){
    res.status(400)
    throw new Error('Please add a product and description')
  }

//   Get user using  JWT
  const user = await User.findById(req.user.id)

  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.create({
    product,
    description,
    user: req.user.id,
    status: 'new'
  })

  res.status(200).json(ticket);
});

module.exports = {
    getTickets,
    getTicket,
    createTicket,
    deleteTicket,
    updateTicket,
    likeTicket,
    submitTicketReview
}