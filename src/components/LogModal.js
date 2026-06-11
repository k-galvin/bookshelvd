import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import StarRating from './StarRating'
import { validateDateRead, prepareLogPayload } from '../utils/validationUtils'

export default function LogModal({ book, onSave, onCancel, initialData = {}, allowNewLog = true }) {
  const [error, setError] = useState('')
  const [userRating, setUserRating] = useState(initialData.userRating || 0)
  const [userReview, setUserReview] = useState(initialData.userReview || '')
  const [saveAsNew, setSaveAsNew] = useState(false)

  // Handle date formatting for the input in local timezone
  const getLocalDateString = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDefaultDate = () => {
    if (initialData.dateRead) {
      // If it's a Firestore Timestamp
      if (initialData.dateRead.toDate) {
        return getLocalDateString(initialData.dateRead.toDate())
      }
      // If it's already a JS Date or string
      return getLocalDateString(new Date(initialData.dateRead))
    }
    return getLocalDateString(new Date())
  }

  const [dateRead, setDateRead] = useState(getDefaultDate())
  const [isLiked, setIsLiked] = useState(initialData.isLiked || false)


  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const validation = validateDateRead(dateRead)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    const parts = dateRead.split('-')
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const localDate = new Date(year, month, day)

    const payload = prepareLogPayload(initialData.id, saveAsNew, {
      userRating,
      userReview,
      dateRead: Timestamp.fromDate(localDate),
      isLiked,
      readCount: 1
    })

    onSave(payload)
  }

  return (
    <div className="popup" onClick={onCancel}>
      <div className="popup-content log-modal" onClick={(e) => e.stopPropagation()}>
        <span className="material-symbols-outlined close-modal-icon" onClick={onCancel}>
          close
        </span>

        <h3>{initialData.id && !saveAsNew ? 'EDIT LOG' : 'ADD TO DIARY'}</h3>
        <h2 className="log-book-title">{book.volumeInfo?.title || book.title}</h2>
        <p className="log-book-authors">{(book.volumeInfo?.authors || book.authors)?.join(', ')}</p>

        {error && <div className="modal-error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {initialData.id && allowNewLog && (
            <div className="form-group save-as-new-group" style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-white)' }}>
                <input 
                  type="checkbox" 
                  checked={saveAsNew} 
                  onChange={(e) => {
                    setSaveAsNew(e.target.checked)
                    if (e.target.checked) {
                      setDateRead(getLocalDateString(new Date()))
                      setUserReview('')
                    } else {
                      setDateRead(getDefaultDate())
                      setUserReview(initialData.userReview || '')
                    }
                  }}
                  className="save-as-new-checkbox"
                  style={{ width: '16px', height: '16px', accentColor: 'var(--lb-green)' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>LOG AS A NEW READ (REREAD)</span>
              </label>
            </div>
          )}
          <div className="form-group">
            <label>DATE READ</label>
            <input 
              type="date" 
              value={dateRead} 
              onChange={(e) => setDateRead(e.target.value)}
              max={getLocalDateString(new Date())}
              className="log-input"
            />
          </div>

          <div className="form-group">
            <label>RATING</label>
            <div className="rating-container-row">
              <StarRating 
                rating={userRating} 
                interactive={true} 
                onChange={setUserRating} 
                size="large"
              />
              <span className="rating-value">{userRating > 0 ? `${userRating}/5` : 'None'}</span>
              {userRating > 0 && (
                <button 
                  type="button" 
                  className="clear-rating-btn" 
                  onClick={() => setUserRating(0)}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>REVIEW</label>
            <textarea 
              value={userReview} 
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Add a review..."
              className="log-input review-text"
            />
          </div>

          <div className="form-group like-group">
            <label>LIKE THIS BOOK</label>
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


