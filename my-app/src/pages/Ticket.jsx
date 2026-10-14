import { useSelector, useDispatch } from 'react-redux'
import { getTicket, reset, closeTicket, likeTicket } from '../features/ticket/ticketSlice'
import { getNotes, createNote, reset as noteReset } from '../features/note/noteSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Spinner from './components/Spinner'
import BackButton from './components/BackButton'
import { toast } from 'react-toastify'
import NoteItem from './components/NoteItem'
import Modal from 'react-modal'
import { FaPlus, FaThumbsUp } from 'react-icons/fa'
import StarRating from './components/StarRating'
import { createTicketReview } from '../features/ticket/ticketSlice'


const customStyle = {
  content: {
    width: '600px',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50',
    transform: 'translate(-50%, -50%)',
    position: 'relative',
  },
}

Modal.setAppElement('#root')

const Ticket = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { ticket, isLoading, isError, message, reviewIsLoading } = useSelector((state) => state.tickets)
  const { notes, isLoading: notesIsLoading } = useSelector((state) => state.notes)
  const safeNotes = Array.isArray(notes) ? notes : [];
  const { user } = useSelector((state) => state.auth)
  const likes = Array.isArray(ticket.likes) ? ticket.likes : [];
  const dispatch = useDispatch()
  const params = useParams()
  const { ticketId } = useParams()
  const navigate = useNavigate()

  const onSubmit = ({ rating, comment }) => {
    dispatch(
      createTicketReview({
        ticketId,
        reviewData: { rating, comment },
      })
    )
  }

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))
  }, [ticketId, isError, message])


  // Close ticket
  const onTicketClose = async () => {
    try {
      const result = await dispatch(closeTicket(ticketId)).unwrap()

      toast.success('Ticket Closed')

      // Stay on the ticket page so the user can leave a review.
    } catch (error) {
      toast.error(
        typeof error === 'string' ? error : 'Failed to close ticket'
      )
    }
  }

  if (isError) {
    return <h3>Something went wrong</h3>
  }

  if (isLoading || notesIsLoading) {
    return <Spinner />
  }

  // Open and close modal
  const openModal = () => {
    setModalIsOpen(true)
  }
  const closeModal = () => {
    setModalIsOpen(false)
  }

  // Submit note
  const onNoteSubmit = (e) => {
    e.preventDefault()

    dispatch(createNote({ noteText, ticketId }))

    setNoteText('')
    closeModal()
  }

  // Get the logged in user's id
  const userId = user?._id || user?.id

  // Check if the user has already liked the ticket
  const isLiked = userId ? likes.some((like) => {
    const likedUserId = typeof like === 'object' && like !== null ? like._id : like;
    return likedUserId?.toString() === userId.toString();
  }) : false

  // like or unlike the ticket
  const onLikeClick = () => {
    dispatch(likeTicket(ticketId))
  }

  return (
    <div className="ticket-page">
      <header className="ticket-header">
        < BackButton url='/tickets' />
        <h2>Ticket ID: {ticket._id}
          <span className={`status status-${ticket.status}`}>{ticket.status}</span>
        </h2>
        <h3>Date Submitted: {new Date(ticket.createdAt).toLocaleString('en-US')}</h3>
        <h3>Product: {ticket.product}</h3>

        <hr />

        <div className="ticket-desc">
          <h3>Description of Issue</h3>
          <p>{ticket.description}</p>
          <div className="ticket-likes">
            <button
              type="button"
              onClick={onLikeClick}
              className="btn"
              disabled={!userId}
              aria-pressed={isLiked}
            >
              <FaThumbsUp color='red' /> ({ticket.likesCount ?? likes.length})
            </button>
          </div>
        </div>
        <h2>Notes</h2>
      </header>

      <button onClick={openModal} className='btn' >
        <FaPlus /> Add Note
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyle}
        contentLabel="Add Note"
      >
        <h3>Add Note</h3>
        <button onClick={closeModal} className='btn-close'>x</button>

        <form onSubmit={onNoteSubmit}>
          <div className="form-group">
            <textarea
              name="noteText"
              id="noteText"
              className="form-control"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note text..." />
          </div>

          <button type="submit" className='btn'>Submit</button>
        </form>
      </Modal>

      {
        safeNotes.map((note) => (
          <NoteItem key={note._id} note={note} />
        ))
      }

      {ticket.status === 'closed' && (
        <StarRating
          existingReview={ticket.review}
          onSubmit={onSubmit}
          isLoading={reviewIsLoading}
        />
      )}

      {ticket.status !== 'closed' && (
        <button onClick={onTicketClose} className='btn btn-block btn-danger'>
          Close Ticket
        </button>
      )}
      {ticket.isClosed && (
        <StarRating
          existingReview={ticket.review}
          onSubmit={onSubmit}
          isLoading={reviewIsLoading}
        />
      )}
    </div>

  )
}

export default Ticket