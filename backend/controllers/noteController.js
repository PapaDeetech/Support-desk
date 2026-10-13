const asyncHandler = require("express-async-handler");

const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const Note = require("../models/noteModel");

// @desc Get Notes for a ticket
// @route GET /api/tickets/:ticketId/notes
// @access Private
const getNotes = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.ticketId);
  
  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const notes = await Note.find({ticket: req.params.ticketId});
  res.status(200).json(notes);
});

// @desc Get a specific note for a ticket
// @route GET /api/tickets/:ticketId/notes/:noteId
// @access Private
const getNote = asyncHandler(async (req, res) => {
  // Get user using id in the JWT
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Find the ticket
  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check if the logged-in user owns the ticket
  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // Find the note associated with this ticket
  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Return the note
  res.status(200).json(note);
});


// @desc Create Ticket Note
// @route POST /api/tickets/:ticketId/notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  const ticket = await Ticket.findById(req.params.ticketId);
  
  if (ticket.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const note = await Note.create({
    ticket: req.params.ticketId,
    user: req.user.id,
    isStaff: false,
    text: req.body.text
  });
  res.status(200).json(note);
});

// @desc Delete a ticket note
// @route DELETE /api/tickets/:ticketId/notes/:noteId
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }
  // Find the ticket
  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check if the logged-in user owns the ticket
  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // Find the note associated with this ticket
  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Allow only the note's creator to delete it
  if (note.user.toString() !== user.id) {
    res.status(403);
    throw new Error('User not authorized to delete this note');
  }

  // Delete the note
  await note.deleteOne();

  res.status(200).json({
    id: note._id,
    success: true,
  });
});
  
// @desc update a ticket note
// @route PUT /api/tickets/:ticketId/notes/:noteId
// @access Private
const updateNote = asyncHandler(async (req, res) => {
    // Get user using id in the JWT
  const user = await User.findById(req.user.id);
  if (!user){
    res.status(401)
    throw new Error('User not found')
  }

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  // Validate the note text
  if (typeof req.body.text !== 'string' || req.body.text.trim() === '') {
    res.status(400);
    throw new Error('Note text is required and must be a non-empty string');
  } 

  // Find the ticket
  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Check if the logged-in user owns the ticket
  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // Find the note associated with this ticket
  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }

  // Allow only the note's creator to update it
  if (note.user.toString() !== user.id) {
    res.status(403);
    throw new Error('User not authorized to update this note');
  }

  // Update the note
  const updatedNote = await Note.findByIdAndUpdate(
    req.params.noteId,
    { text: req.body.text },
    { new: true }
  );

  res.status(200).json(updatedNote);
});

module.exports= {
    getNotes,
    getNote,
    createNote,
    deleteNote,
    updateNote
}
