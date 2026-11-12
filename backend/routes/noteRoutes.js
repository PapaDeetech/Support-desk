const express = require('express');
const router = express.Router({mergeParams: true});
const { getNotes,getNote, createNote, deleteNote, updateNote} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require("../middleware/uploadMiddleware");

router.route('/').get(protect, getNotes).post(protect, upload.array("attachments", 3), createNote)
router.route('/:noteId').get(protect, getNote).delete(protect, deleteNote).put(protect, updateNote);

module.exports = router
