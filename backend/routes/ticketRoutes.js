const express = require('express')
const router = express.Router()
const {getTickets, getTicket, createTicket, deleteTicket, updateTicket, likeTicket} = require('../controllers/ticketController')
const {protect} = require('../middleware/authMiddleware')

// Re-route into note router
const noteRouter = require('./noteRoutes')
router.use('/:ticketId/notes', noteRouter)
const {submitTicketReview} = require('../controllers/ticketController')

router.route('/').get(protect, getTickets).post(protect, createTicket)
router.route('/:id').get(protect, getTicket).delete(protect, deleteTicket).put(protect, updateTicket)
router.route('/:id/like').put(protect, likeTicket)

router.post('/:id/review', protect, submitTicketReview)

module.exports = router