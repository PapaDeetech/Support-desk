const mongoose = require('mongoose');

// Define the Ticket schema
const ticketSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: String,
    required: [true, 'Please select a product'],
    enum: ['Iphone', 'Macbook Pro', 'Hp Elitebook', 'Dell Inspiron'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description of the issue'],
  },
  status: {
    type: String,
    enum: ['new', 'open', 'closed'],
    default: 'new'
  },

  likes: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
],

// Star Ratings
review: {
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
},
},

{
  timestamps: true
}

);

// Export the Ticket model
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;