import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'

export default function LogModal({ book, onSave, onCancel }) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [dateRead, setDateRead] = useState(new Date().toISOString().split('T')[0])
  const [isLiked, setIsLiked] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      rating,
      review,
      dateRead: Timestamp.fromDate(new Date(dateRead)),
      isLiked
    })
  }

  return (
    <div className="popup" onClick={onCancel}>
      <div className="popup-content log-modal" onClick={(e) => e.stopPropagation()}>
        <h3>I READ...</h3>
        <h2 className="log-book-title">{book.volumeInfo?.title || book.title}</h2>
        <p className="log-book-authors">{(book.volumeInfo?.authors || book.authors)?.join(', ')}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>DATE READ</label>
            <input 
              type="date" 
              value={dateRead} 
              onChange={(e) => setDateRead(e.target.value)}
              className="log-input"
            />
          </div>

          <div className="form-group">
            <label>RATING</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`star ${rating >= star ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
              <span className="rating-value">{rating > 0 ? `${rating}/5` : 'None'}</span>
            </div>
          </div>

          <div className="form-group">
            <label>REVIEW</label>
            <textarea 
              value={review} 
              onChange={(e) => setReview(e.target.value)}
              placeholder="Add a review..."
              className="log-input review-text"
            />
          </div>

          <div className="form-group like-group">
            <label>LIKE</label>
            <span 
              className={`like-btn material-symbols-outlined ${isLiked ? 'active' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              favorite
            </span>
          </div>

          <div className="log-modal-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>CANCEL</button>
            <button type="submit" className="save-btn">SAVE</button>
          </div>
        </form>
      </div>
    </div>
  )
}
