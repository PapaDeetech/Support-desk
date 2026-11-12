import { useSelector, useDispatch } from 'react-redux'
import {
  getTicket,
  closeTicket,
  likeTicket,
  createTicketReview,
} from '../features/ticket/ticketSlice'
import {
  getNotes,
  createNote,
} from '../features/note/noteSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Spinner from './components/Spinner'
import BackButton from './components/BackButton'
import { toast } from 'react-toastify'
import NoteItem from './components/NoteItem'
import Modal from 'react-modal'
import { FaPlus, FaThumbsUp } from 'react-icons/fa'
import StarRating from './components/StarRating'

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const customStyle = {
  content: {
    width: '600px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    position: 'relative',
  },
}

Modal.setAppElement('#root')

const Ticket = () => {
  const { ticketId } = useParams()
  const dispatch = useDispatch()

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [attachments, setAttachments] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const {
    ticket,
    isLoading,
    isError,
    message,
    reviewIsLoading,
  } = useSelector((state) => state.tickets)

  const {
    notes,
    isLoading: notesIsLoading,
  } = useSelector((state) => state.notes)

  const { user } = useSelector((state) => state.auth)

  const safeNotes = Array.isArray(notes) ? notes : []
  const likes = Array.isArray(ticket?.likes) ? ticket.likes : []

  const userId = user?._id || user?.id

  // Create and clean up image preview URLs
  useEffect(() => {
    const previews = attachments.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setImagePreviews(previews)

    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [attachments])

  // Load ticket and notes
  useEffect(() => {
    if (!ticketId) return

    dispatch(getTicket(ticketId))
    dispatch(getNotes(ticketId))
  }, [dispatch, ticketId])

  // Show ticket loading errors
  useEffect(() => {
    if (isError && message) {
      toast.error(message)
    }
  }, [isError, message])

  // Open and close modal
  const openModal = () => {
    setModalIsOpen(true)
  }

  const closeModal = () => {
    if (isSubmittingNote) return
    setModalIsOpen(false)
  }

  // Select and validate note images
  const onImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (attachments.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} pictures.`)
      e.target.value = ''
      return
    }

    const validFiles = []

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(
          `${file.name}: Only JPG, PNG and WEBP images are allowed.`
        )
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Image must not exceed 5MB.`)
        continue
      }

      validFiles.push(file)
    }

    setAttachments((prev) => [...prev, ...validFiles])
    e.target.value = ''
  }

  // Remove selected image
  const removeImage = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit note with optional attachments
  const onNoteSubmit = async (e) => {
    e.preventDefault()

    if (!noteText.trim() && attachments.length === 0) {
      toast.error('Please enter a note or attach an image.')
      return
    }

    setIsSubmittingNote(true)

    try {
      await dispatch(
        createNote({
          noteText,
          ticketId,
          attachments,
        })
      ).unwrap()

      toast.success('Note added successfully.')

      setNoteText('')
      setAttachments([])
      setModalIsOpen(false)

      // Refresh notes so the new note appears
      dispatch(getNotes(ticketId))
    } catch (error) {
      toast.error(
        typeof error === 'string'
          ? error
          : error?.message || 'Failed to add note.'
      )
    } finally {
      setIsSubmittingNote(false)
    }
  }

  // Close ticket
  const onTicketClose = async () => {
    try {
      await dispatch(closeTicket(ticketId)).unwrap()
      toast.success('Ticket Closed')
      dispatch(getTicket(ticketId))
    } catch (error) {
      toast.error(
        typeof error === 'string'
          ? error
          : 'Failed to close ticket.'
      )
    }
  }

  // Check whether the current user has liked this ticket
  const isLiked = userId
    ? likes.some((like) => {
        const likedUserId =
          typeof like === 'object' && like !== null
            ? like._id
            : like

        return likedUserId?.toString() === userId.toString()
      })
    : false

  // Like or unlike ticket
  const onLikeClick = () => {
    dispatch(likeTicket(ticketId))
  }

  // Submit ticket review
  const onSubmit = ({ rating, comment }) => {
    dispatch(
      createTicketReview({
        ticketId,
        reviewData: { rating, comment },
      })
    )
  }

  if (isLoading || notesIsLoading) {
    return <Spinner />
  }

  if (isError) {
    return <h3>Something went wrong</h3>
  }

  if (!ticket?._id) {
    return <h3>Ticket not found.</h3>
  }

  return (
    <div className="ticket-page">
      <header className="ticket-header">
        <BackButton url="/tickets" />

        <h2>
          Ticket ID: {ticket._id}
          <span className={`status status-${ticket.status}`}>
            {ticket.status}
          </span>
        </h2>

        <h3>
          Date Submitted:{' '}
          {new Date(ticket.createdAt).toLocaleString('en-US')}
        </h3>

        <h3>Product: {ticket.product}</h3>

        <hr />

        <div className="ticket-desc">
          <h3>Description of Issue</h3>
          <p>{ticket.description}</p>

          {/* Ticket attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="attachment-preview">
              {ticket.attachments.map((attachment, index) => (
                <div
                  className="attachment-item"
                  key={attachment.public_id || index}
                >
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.originalName || `Ticket attachment ${index + 1}`}
                    />
                  </a>
                  <small>{attachment.originalName}</small>
                </div>
              ))}
            </div>
          )}

          <div className="ticket-likes">
            <button
              type="button"
              onClick={onLikeClick}
              className="btn"
              disabled={!userId}
              aria-pressed={isLiked}
            >
              <FaThumbsUp color="red" /> (
              {ticket.likesCount ?? likes.length})
            </button>
          </div>
        </div>

        <h2>Notes</h2>
      </header>

      <button onClick={openModal} className="btn">
        <FaPlus /> Add Note
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyle}
        contentLabel="Add Note"
        shouldCloseOnOverlayClick={!isSubmittingNote}
      >
        <h3>Add Note</h3>

        <button
          type="button"
          onClick={closeModal}
          className="btn-close"
          disabled={isSubmittingNote}
        >
          x
        </button>

        <form onSubmit={onNoteSubmit}>
          <div className="form-group">
            <label htmlFor="noteText">Note</label>

            <textarea
              name="noteText"
              id="noteText"
              className="form-control"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter note text..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="noteAttachments">
              Attach Pictures (Optional)
            </label>

            <p className="upload-description">
              Upload pictures to support your note.
              Maximum 3 pictures, 5MB each. JPG, PNG or WEBP.
            </p>

            <input
              type="file"
              id="noteAttachments"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onImageChange}
              disabled={
                attachments.length >= MAX_FILES || isSubmittingNote
              }
            />

            {imagePreviews.length > 0 && (
              <div className="attachment-preview">
                {imagePreviews.map((preview, index) => (
                  <div
                    className="attachment-item"
                    key={`${preview.name}-${index}`}
                  >
                    <img
                      src={preview.url}
                      alt={`Note attachment ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeImage(index)}
                      disabled={isSubmittingNote}
                      aria-label={`Remove ${preview.name}`}
                    >
                      Remove
                    </button>

                    <small>{preview.name}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn"
            disabled={isSubmittingNote}
          >
            {isSubmittingNote ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </Modal>

      {/* Display notes */}
      {safeNotes.map((note) => (
        <NoteItem key={note._id} note={note} />
      ))}

      {/* Review for closed tickets */}
      {ticket.status === 'closed' && (
        <StarRating
          existingReview={ticket.review}
          onSubmit={onSubmit}
          isLoading={reviewIsLoading}
        />
      )}

      {/* Close ticket */}
      {ticket.status !== 'closed' && (
        <button
          onClick={onTicketClose}
          className="btn btn-block btn-danger"
        >
          Close Ticket
        </button>
      )}
    </div>
  )
}

export default Ticket