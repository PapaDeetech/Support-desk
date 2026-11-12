const asyncHandler = require("express-async-handler");

const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const Note = require("../models/noteModel");
const cloudinary = require("../config/cloudinary");

// Upload an image buffer to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "support-desk/note-attachments",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Delete uploaded images from Cloudinary
const deleteCloudinaryImages = async (attachments = []) => {
  if (!attachments.length) return;

  await Promise.allSettled(
    attachments.map((image) =>
      cloudinary.uploader.destroy(image.public_id)
    )
  );
};

// @desc Get Notes for a ticket
// @route GET /api/tickets/:ticketId/notes
// @access Private
const getNotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized");
  }

  const notes = await Note.find({
    ticket: req.params.ticketId,
  });

  res.status(200).json(notes);
});

// @desc Get a specific note for a ticket
// @route GET /api/tickets/:ticketId/notes/:noteId
// @access Private
const getNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized");
  }

  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  res.status(200).json(note);
});

// @desc Create Ticket Note
// @route POST /api/tickets/:ticketId/notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const files = req.files || [];

  // Allow text-only, image-only, or combined notes.
  if ((!text || !text.trim()) && files.length === 0) {
    res.status(400);
    throw new Error("Please add note text or at least one image");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized");
  }

  const uploadedImages = [];

  try {
    // Upload attachments to Cloudinary.
    for (const file of files) {
      const result = await uploadToCloudinary(file);

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
        originalName: file.originalname,
      });
    }

    // Save note and uploaded attachments.
    const note = await Note.create({
      ticket: req.params.ticketId,
      user: user._id,
      isStaff: false,
      text: text?.trim() || "",
      attachments: uploadedImages,
    });

    res.status(201).json(note);
  } catch (error) {
    // Remove uploaded images if saving the note fails.
    await deleteCloudinaryImages(uploadedImages);

    throw error;
  }
});

// @desc Delete a ticket note
// @route DELETE /api/tickets/:ticketId/notes/:noteId
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized");
  }

  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized to delete this note");
  }

  // Delete the note's Cloudinary images.
  await deleteCloudinaryImages(note.attachments);

  await note.deleteOne();

  res.status(200).json({
    id: note._id,
    success: true,
  });
});

// @desc Update a ticket note
// @route PUT /api/tickets/:ticketId/notes/:noteId
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  if (typeof req.body.text !== "string" || !req.body.text.trim()) {
    res.status(400);
    throw new Error("Note text is required and must be a non-empty string");
  }

  const ticket = await Ticket.findById(req.params.ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized");
  }

  const note = await Note.findOne({
    _id: req.params.noteId,
    ticket: req.params.ticketId,
  });

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== user.id) {
    res.status(403);
    throw new Error("User not authorized to update this note");
  }

  note.text = req.body.text.trim();

  await note.save();

  res.status(200).json(note);
});

module.exports = {
  getNotes,
  getNote,
  createNote,
  deleteNote,
  updateNote,
};