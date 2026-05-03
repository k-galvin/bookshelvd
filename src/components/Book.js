import { useState, useEffect } from 'react'
import BookInfo from './BookInfo'
import LogModal from './LogModal'

export default function Book({
  book,
  loggedBooks,
  watchlist,
  addBook,
  deleteBook,
  user,
  addToWatchlist,
  cover,
  title,
  size,
  authors,
  description,
  averageRating
}) {
  const [isBookLogged, setIsBookLogged] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [displayInfo, setDisplayInfo] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)

  // Update whether a book has been logged or is in watchlist
  useEffect(() => {
    const volumeId = book.id || book.volumeId
    
    if (loggedBooks) {
      const loggedInstance = loggedBooks.find(lb => lb.volumeId === volumeId || lb.id === book.id);
      setIsBookLogged(!!loggedInstance)
      if (loggedInstance) {
        setIsLiked(loggedInstance.isLiked || false)
        setUserRating(loggedInstance.userRating || 0)
      }
    }

    if (watchlist) {
      setIsInWatchlist(watchlist.some(b => b.volumeId === volumeId))
    }
  }, [loggedBooks, watchlist, book])

  const handleEyeClick = (e) => {
    e.stopPropagation();
    if (isBookLogged) {
      const loggedInstance = loggedBooks.find(lb => lb.volumeId === (book.id || book.volumeId) || lb.id === book.id);
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
    // In a full implementation, we would update the DB here
    setIsLiked(!isLiked);
  }

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (addToWatchlist) {
      addToWatchlist(user, book);
    }
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
      <div className="cover-container" style={sizeStyle} onClick={() => setDisplayInfo(true)}>
        <img
          src={cover || 'https://via.placeholder.com/150x225?text=No+Cover'}
          className="cover-img"
          alt={`${title}`}
          style={sizeStyle}
        />

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
              className={`action-btn material-symbols-outlined ${isInWatchlist ? 'active' : ''}`} 
              onClick={handleWatchlistClick}
              title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
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

      {/* Popup of book info shown when book cover is clicked */}
      {displayInfo && (
        <BookInfo
          setDisplayInfo={setDisplayInfo}
          title={title}
          authors={authors}
          description={description}
          averageRating={averageRating}
        />
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
