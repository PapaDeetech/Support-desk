const mongoose = require('mongoose');

// Define the Note Document
const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Please add a note'],
  },
  isStaff: {
    type: Boolean,
    default: false
  },
  staffId: {
    type: String,
  },
},
{
  timestamps: true
}

);

// Create a model based on the schema
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;