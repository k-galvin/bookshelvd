import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LogModal from './LogModal'

export default function Book({
  book,
  loggedBooks,
  tbr,
  addBook,
  deleteBook,
  user,
  addToTBR,
  cover,
  title,
  size,
  authors,
  description,
  averageRating
}) {
  const navigate = useNavigate()
  const [isBookLogged, setIsBookLogged] = useState(false)
  const [isInTBR, setIsInTBR] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)

  // Update whether a book has been logged or is in tbr
  useEffect(() => {
    const volumeId = book.volumeId || book.id
    
    if (loggedBooks) {
      const loggedInstance = loggedBooks.find(lb => lb.volumeId === volumeId);
      setIsBookLogged(!!loggedInstance)
      if (loggedInstance) {
        setIsLiked(loggedInstance.isLiked || false)
        setUserRating(loggedInstance.userRating || 0)
      }
    }

    if (tbr) {
      setIsInTBR(tbr.some(b => b.volumeId === volumeId))
    }
  }, [loggedBooks, tbr, book])

  const handleEyeClick = (e) => {
    e.stopPropagation();
    const volumeId = book.volumeId || book.id
    if (isBookLogged) {
      const loggedInstance = loggedBooks.find(lb => lb.volumeId === volumeId);
      if (loggedInstance) {
        deleteBook(user, loggedInstance)
      }
    } else {
      setShowLogModal(true)
    }
  }

  const handleSaveLog = (logDetails) => {
    addBook(user, book, logDetails)
    setShowLogModal(false)
  }

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  }

  const handleTBRClick = (e) => {
    e.stopPropagation();
    if (addToTBR) {
      addToTBR(user, book);
    }
  }

  const handleCoverClick = () => {
    // Always prioritize volumeId (the Google ID) for navigation
    const targetId = book.volumeId || book.id
    navigate(`/book/${targetId}`)
  }

  // Determine if a book show be displayed in a large or small size
  const getSizeStyle = () => {
    if (size === 'large') {
      return { width: '150px', height: '225px' }
    } else {
      return { width: '100px', height: '150px' }
    }
  }

  const sizeStyle = getSizeStyle()

  return (
    <div className={size === 'large' ? 'large-book-container' : 'small-book-container'}>
      <div className="cover-container" style={sizeStyle} onClick={handleCoverClick}>
        {cover ? (
          <img
            src={cover}
            className="cover-img"
            alt={`${title}`}
            style={sizeStyle}
          />
        ) : (
          <div className="no-cover" style={sizeStyle}>
            <div className="no-cover-title">{title}</div>
            <div className="no-cover-author">{authors?.join(', ')}</div>
          </div>
        )}

        <div className="overlay-icon">
          <div className="book-actions">
            <span 
              className={`action-btn material-symbols-outlined ${isBookLogged ? 'active' : ''}`} 
              onClick={handleEyeClick}
              title={isBookLogged ? "Remove from Log" : "Log this book"}
            >
              visibility
            </span>
            <span 
              className={`action-btn material-symbols-outlined ${isLiked ? 'active' : ''}`} 
              onClick={handleLikeClick}
              title="Like"
            >
              favorite
            </span>
            <span 
              className={`action-btn material-symbols-outlined ${isInTBR ? 'active' : ''}`} 
              onClick={handleTBRClick}
              title={isInTBR ? "Remove from TBR" : "Add to TBR"}
            >
              schedule
            </span>
          </div>
        </div>
      </div>

      {isBookLogged && (userRating > 0 || isLiked) && (
        <div className="book-rating-display">
          {userRating > 0 && [...Array(5)].map((_, i) => (
            <span key={i} className={`small-star ${i < userRating ? 'filled' : ''}`}>
              ★
            </span>
          ))}
          {isLiked && <span className="material-symbols-outlined small-heart-icon">favorite</span>}
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogModal 
          book={book} 
          onSave={handleSaveLog} 
          onCancel={() => setShowLogModal(false)} 
        />
      )}
    </div>
  )
}
