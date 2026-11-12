const mongoose = require("mongoose");

// Define the Note Document
const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    text: {
      type: String,
      default: "",
      trim: true,
    },
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
        },
      },
    ],
    isStaff: {
      type: Boolean,
      default: false,
    },
    staffId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure every note contains text or at least one attachment.

noteSchema.pre("validate", function () {
  if (
    !this.text?.trim() &&
    (!this.attachments || this.attachments.length === 0)
  ) {
    this.invalidate("text", "A note must contain text or an attachment.");
  }
});

// Create a model based on the schema
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
