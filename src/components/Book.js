import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LogModal from './LogModal'
import StarRating from './StarRating'

const getMostRecentLog = (loggedBooks, volumeId) => {
  if (!loggedBooks) return null
  const matched = loggedBooks.filter(lb => lb.volumeId === volumeId)
  if (matched.length === 0) return null
  
  const getMs = (val) => {
    if (!val) return 0;
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (val.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
    return new Date(val).getTime();
  };

  return [...matched].sort((a, b) => {
    const timeA = getMs(a.dateRead) || getMs(a.createdAt);
    const timeB = getMs(b.dateRead) || getMs(b.createdAt);
    return timeB - timeA;
  })[0];
}

export default function Book({
  book,
  loggedBooks = [],
  tbr = [],
  addBook,
  deleteBook,
  updateBook,
  user,
  addToTBR,
  cover,
  title,
  size,
  authors,
  description,
  averageRating,
  lists = [],
  onAssignToList,
  onMarkAsRead,
  onUpdateBookRating
}) {
  const navigate = useNavigate()
  const [isBookLogged, setIsBookLogged] = useState(false)
  const [isInTBR, setIsInTBR] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)

  // Popover menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(false)
  const menuRef = useRef(null)

  // Update states based on global collections
  useEffect(() => {
    const volumeId = book.volumeId || book.id
    
    if (loggedBooks) {
      const loggedInstance = getMostRecentLog(loggedBooks, volumeId)
      setIsBookLogged(!!loggedInstance)
      if (loggedInstance) {
        setIsLiked(loggedInstance.isLiked || false)
        setUserRating(loggedInstance.userRating || 0)
      } else {
        setIsLiked(false)
        setUserRating(0)
      }
    }

    if (tbr) {
      setIsInTBR(tbr.some(b => b.volumeId === volumeId))
    }
  }, [loggedBooks, tbr, book])

  // Handle click outside to close popover menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Adjust popover direction if it overflows the viewport bottom
  useLayoutEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > viewportHeight) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    } else if (!isMenuOpen) {
      setOpenUpwards(false);
    }
  }, [isMenuOpen]);

  const handleEyeClick = (e) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(user, book)
    } else {
      // Fallback behavior if not defined
      const volumeId = book.volumeId || book.id
      if (isBookLogged) {
        const loggedInstance = getMostRecentLog(loggedBooks, volumeId)
        if (loggedInstance) {
          deleteBook(user, loggedInstance)
        }
      } else {
        setShowLogModal(true)
      }
    }
  }

  const handleSaveLog = (logDetails) => {
    if (logDetails.id) {
      updateBook(user, logDetails.id, logDetails)
    } else {
      addBook(user, book, logDetails)
    }
    setShowLogModal(false)
    setIsMenuOpen(false)
  }

  const handleLikeClick = (e) => {
    e.stopPropagation();
    const volumeId = book.volumeId || book.id
    const newLikedState = !isLiked
    setIsLiked(newLikedState);

    if (isBookLogged) {
      const loggedInstance = getMostRecentLog(loggedBooks, volumeId)
      if (loggedInstance && updateBook) {
        updateBook(user, loggedInstance.id, { isLiked: newLikedState })
      }
    } else {
      addBook(user, book, { isLiked: newLikedState, userRating: 0, userReview: '' })
    }
  }

  const handleTBRClick = (e) => {
    e.stopPropagation();
    if (addToTBR) {
      addToTBR(user, book);
    }
  }

  const handleCoverClick = () => {
    const targetId = book.volumeId || book.id
    navigate(`/book/${targetId}`)
  }

  const handleRatingChange = async (newRating) => {
    if (onUpdateBookRating) {
      await onUpdateBookRating(user, book, newRating)
    } else if (isBookLogged) {
      const volumeId = book.volumeId || book.id
      const loggedInstance = getMostRecentLog(loggedBooks, volumeId)
      if (loggedInstance && updateBook) {
        updateBook(user, loggedInstance.id, { userRating: newRating })
      }
    } else {
      addBook(user, book, { userRating: newRating, isLiked: false, userReview: '' })
    }
  }

  const handleClearRating = async (e) => {
    e.stopPropagation()
    await handleRatingChange(0)
  }

  const handleListCheckboxChange = async (e, listId, isInList) => {
    e.stopPropagation()
    if (onAssignToList) {
      await onAssignToList(user, listId, book, !isInList)
    }
  }

  const handleLogClickFromMenu = (e) => {
    e.stopPropagation()
    setShowLogModal(true)
  }

  const getSizeStyle = () => {
    if (size === 'large') {
      return { width: '150px', height: '225px' }
    } else {
      return { width: '100px', height: '150px' }
    }
  }

  const sizeStyle = getSizeStyle()
  const volumeId = book.volumeId || book.id

  return (
    <div className={`${size === 'large' ? 'large-book-container' : 'small-book-container'} ${isMenuOpen ? 'popover-open' : ''}`}>
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
            {/* Eye Icon */}
            <span 
              className={`action-btn eye-btn material-symbols-outlined ${isBookLogged ? 'active' : ''}`} 
              onClick={handleEyeClick}
              title={isBookLogged ? "Mark as unread" : "Mark as read"}
            >
              visibility
            </span>

            {/* Heart Icon */}
            <span 
              className={`action-btn heart-btn material-symbols-outlined ${isLiked ? 'active' : ''}`} 
              onClick={handleLikeClick}
              title={isLiked ? "Unlike" : "Like"}
            >
              favorite
            </span>

            {/* Three Dots More Menu */}
            <span 
              className={`action-btn options-btn material-symbols-outlined ${isMenuOpen ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              title="More options"
            >
              more_horiz
            </span>
          </div>
        </div>
      </div>

      {/* Click-to-open Popover Menu */}
      {isMenuOpen && (
        <div 
          className={`book-card-popover ${openUpwards ? 'open-upwards' : ''}`} 
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popover-header">
            <span className="popover-book-title">{title}</span>
            <span 
              className="material-symbols-outlined close-popover-btn" 
              onClick={() => setIsMenuOpen(false)}
            >
              close
            </span>
          </div>

          <div className="popover-body">
            {/* 1) Star Rating Slider (direct save) */}
            <div className="popover-section rating-section">
              <span className="section-label">Rate</span>
              <div className="popover-rating-row">
                <StarRating 
                  rating={userRating} 
                  interactive={true} 
                  onChange={handleRatingChange} 
                  size="medium"
                />
                {userRating > 0 && (
                  <button 
                    className="popover-clear-rating-btn" 
                    onClick={handleClearRating}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* 2) TBR toggle */}
            <div className="popover-section action-section">
              <button 
                className={`popover-action-btn ${isInTBR ? 'active' : ''}`}
                onClick={(e) => {
                  handleTBRClick(e);
                }}
              >
                <span className="material-symbols-outlined">
                  {isInTBR ? 'check' : 'add'}
                </span>
                <span>TBR</span>
              </button>

              {/* Review or Log button */}
              <button 
                className="popover-action-btn"
                onClick={handleLogClickFromMenu}
              >
                <span className="material-symbols-outlined">edit_document</span>
                <span>Review or Log...</span>
              </button>
            </div>

            {/* 3) Add to custom lists checklist */}
            <div className="popover-section lists-section">
              <span className="section-label">Add to lists</span>
              {lists.length > 0 ? (
                <div className="popover-lists-list">
                  {lists.map((list) => {
                    const isInList = list.books?.some(b => b.volumeId === volumeId)
                    return (
                      <label key={list.id} className="popover-list-item-label">
                        <input 
                          type="checkbox"
                          checked={isInList || false}
                          onChange={(e) => handleListCheckboxChange(e, list.id, isInList)}
                        />
                        <span className="popover-list-name">{list.name}</span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <span className="no-lists-message">No lists created.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {isBookLogged && (userRating > 0 || isLiked) && (
        <div className="book-rating-display">
          {userRating > 0 && <StarRating rating={userRating} size="small" />}
          {isLiked && <span className="material-symbols-outlined small-heart-icon">favorite</span>}
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogModal 
          book={book} 
          onSave={handleSaveLog} 
          onCancel={() => setShowLogModal(false)} 
          initialData={
            getMostRecentLog(loggedBooks, volumeId) || {}
          }
        />
      )}
    </div>
  )
}

