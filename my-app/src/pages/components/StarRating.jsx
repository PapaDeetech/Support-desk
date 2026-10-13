
import { useState } from 'react'
import { FaStar } from 'react-icons/fa'

function StarRating({ onSubmit, existingReview, isLoading = false }) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (rating < 1 || rating > 5) {
      return
    }

    onSubmit({ rating, comment })
  }

  if (existingReview) {
    return (
      <div className="star-review">
        <h3>Your review</h3>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              color={star <= existingReview.rating ? '#f5b301' : '#ccc'}
            />
          ))}
        </div>

        <p>Rating: {existingReview.rating}/5</p>
        {existingReview.comment && <p>{existingReview.comment}</p>}
        <p>Thank you for your feedback!</p>
      </div>
    )
  }

  return (
    <form className="star-review" onSubmit={handleSubmit}>
      <h3>Rate your support experience</h3>
      <p>How was your experience with this ticket?</p>

      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="star-button"
            aria-label={`Rate ${star} out of 5 stars`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <FaStar
              color={star <= (hover || rating) ? '#f5b301' : '#ccc'}
            />
          </button>
        ))}
      </div>

      <p>{rating ? `You selected ${rating} out of 5 stars` : 'Select a rating'}</p>

      <div className="form-group">
        <label htmlFor="reviewComment">Comment (optional)</label>
        <textarea
          id="reviewComment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience..."
          rows="4"
          maxLength="1000"
        />
      </div>

      <button
        type="submit"
        className="btn"
        disabled={rating === 0 || isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}

export default StarRating
