const express = require('express');
const router = express.Router({mergeParams: true});
const { getNotes,getNote, createNote, deleteNote, updateNote} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotes).post(protect, createNote)
router.route('/:noteId').get(protect, getNote).delete(protect, deleteNote).put(protect, updateNote);

module.exports = router
