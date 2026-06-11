import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchBookById, fetchOriginalPublicationYear } from '../services/apiService'
import LogModal from './LogModal'
import LoginPage from './LoginPage'
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


export default function BookDetailPage({ 
  user, 
  loggedBooks, 
  tbr, 
  addBook, 
  deleteBook, 
  updateBook, 
  addToTBR,
  lists = [],
  onAssignToList,
  onMarkAsRead,
  onUpdateBookRating
}) {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [originalYear, setOriginalYear] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [isBookLogged, setIsBookLogged] = useState(false)
  const [isInTBR, setIsInTBR] = useState(false)
  const [userLog, setUserLog] = useState(null)

  useEffect(() => {
    async function getBook() {
      try {
        const data = await fetchBookById(id)
        setBook(data)
        
        // Fetch original year from Open Library
        if (data?.volumeInfo?.title) {
          const year = await fetchOriginalPublicationYear(
            data.volumeInfo.title, 
            data.volumeInfo.authors?.[0]
          )
          setOriginalYear(year)
        }
      } catch (error) {
        console.error("Error fetching book:", error)
      } finally {
        setLoading(false)
      }
    }
    getBook()
  }, [id])

  useEffect(() => {
    if (loggedBooks && id) {
      const loggedInstance = getMostRecentLog(loggedBooks, id);
      setIsBookLogged(!!loggedInstance)
      setUserLog(loggedInstance || null)
    }
    if (tbr && id) {
      setIsInTBR(tbr.some(b => b.volumeId === id))
    }
  }, [loggedBooks, tbr, id])

  const handleSaveLog = (logDetails) => {
    if (logDetails.id) {
      updateBook(user, logDetails.id, { ...logDetails, originalYear })
    } else {
      addBook(user, book, { ...logDetails, originalYear })
    }
    setShowLogModal(false)
  }

  const handleLikeClick = () => {
    if (isBookLogged && userLog) {
      updateBook(user, userLog.id, { isLiked: !userLog.isLiked })
    } else {
      addBook(user, book, { isLiked: true, userRating: 0, userReview: '' })
    }
  }

  const handleRatingSelect = async (ratingValue) => {
    if (onUpdateBookRating) {
      await onUpdateBookRating(user, book || { id, volumeId: id }, ratingValue)
    } else if (isBookLogged && userLog) {
      updateBook(user, userLog.id, { userRating: ratingValue })
    } else {
      addBook(user, book, { userRating: ratingValue, isLiked: false, userReview: '' })
    }
  }

  const handleEyeClick = async () => {
    if (onMarkAsRead) {
      await onMarkAsRead(user, book || { id, volumeId: id })
    } else {
      if (isBookLogged) {
        deleteBook(user, userLog)
      } else {
        setShowLogModal(true)
      }
    }
  }

  const handleTBRClick = () => {
    if (addToTBR) {
      addToTBR(user, book || { id, volumeId: id })
    }
  }

  if (!user) return <LoginPage />
  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>
  if (!book) return <div className="pages-container">Book not found.</div>

  const info = book.volumeInfo
  
  // Helper to ensure image URLs are HTTPS
  const ensureHttps = (url) => {
    if (!url) return null;
    return url.replace('http://', 'https://');
  };

  const cover = ensureHttps(
    info.imageLinks?.thumbnail || 
    info.imageLinks?.smallThumbnail ||
    info.imageLinks?.extraLarge || 
    info.imageLinks?.large || 
    info.imageLinks?.medium
  );

  return (
    <div className="book-detail-page">
      {/* Backdrop */}
      <div className="backdrop-container">
        <div 
          className="backdrop-image" 
          style={{ backgroundImage: cover ? `url(${cover})` : 'none' }}
        >
          {!cover && <div className="backdrop-placeholder"></div>}
        </div>
        <div className="backdrop-overlay"></div>
      </div>

      <div className="book-detail-content">
        {/* Left Column: Cover */}
        <div className="detail-left">
          <div className="large-cover-container">
            {cover ? (
              <img src={cover} alt={info.title} />
            ) : (
              <div className="no-cover large">
                <div className="no-cover-title">{info.title}</div>
                <div className="no-cover-author">{info.authors?.join(', ')}</div>
              </div>
            )}
          </div>
          
          {/* Average Rating Stats display */}
          {info.averageRating && (
            <div className="average-rating-container">
              <span className="avg-rating-val">{info.averageRating}</span>
              <span className="avg-rating-lbl">Google Rating</span>
            </div>
          )}
        </div>

        {/* Center Column: Meta & Review */}
        <div className="detail-center">
          <h1 className="book-page-title">{info.title}</h1>
          <div className="book-page-meta">
            <span className="release-year">
              {originalYear || info.publishedDate?.split('-')[0]}
            </span>
            {originalYear && info.publishedDate?.split('-')[0] !== originalYear.toString() && (
              <span className="edition-year">
                This edition published in {info.publishedDate?.split('-')[0]}
              </span>
            )}
            <span className="meta-separator">By</span>
            <span className="author-names">
              {info.authors?.map((author, index) => (
                <span key={author}>
                  {index > 0 && ', '}
                  <Link to={`/author/${encodeURIComponent(author)}`} className="author-link">
                    {author}
                  </Link>
                </span>
              ))}
            </span>
          </div>
          
          <div className="book-page-description">
            {info.description?.replace(/<[^>]*>/g, '') || "No description available."}
          </div>

          {userLog && (
            <div className="user-review-section">
              <h3 className="section-title-underlined">YOUR REVIEW</h3>
              <div className="user-rating-display">
                {userLog.userRating > 0 && <StarRating rating={userLog.userRating} size="medium" />}
                {userLog.isLiked && <span className="material-symbols-outlined review-heart-icon">favorite</span>}
              </div>
              <p className="user-review-text">{userLog.userReview || "No written review yet. Click Edit below to write one."}</p>
            </div>
          )}
        </div>

        {/* Right Column: Actions sidebar */}
        <div className="detail-right">
          <div className="action-panel">
            {/* Upper Action Toggles */}
            <div className="panel-actions-row">
              <div 
                className={`action-icon-btn ${isBookLogged ? 'active-green' : ''}`}
                onClick={handleEyeClick}
                title={isBookLogged ? "Mark as unread" : "Mark as read"}
              >
                <span className="material-symbols-outlined">visibility</span>
                <span className="btn-label">Read</span>
              </div>

              <div 
                className={`action-icon-btn ${userLog?.isLiked ? 'active-orange' : ''}`}
                onClick={handleLikeClick}
                title={userLog?.isLiked ? "Unlike" : "Like"}
              >
                <span className="material-symbols-outlined">favorite</span>
                <span className="btn-label">Like</span>
              </div>

              <div 
                className={`action-icon-btn ${isInTBR ? 'active-blue' : ''}`}
                onClick={handleTBRClick}
                title={isInTBR ? "Remove from TBR" : "Add to TBR"}
              >
                <span className="material-symbols-outlined">schedule</span>
                <span className="btn-label">TBR</span>
              </div>
            </div>

            {/* Sidebar Star Rating Selector */}
            <div className="panel-rating-section">
              <label>RATE</label>
              <div className="panel-rating-row">
                <StarRating 
                  rating={userLog?.userRating || 0} 
                  interactive={true} 
                  onChange={handleRatingSelect} 
                  size="medium"
                />
                {userLog?.userRating > 0 && (
                  <button 
                    className="clear-rating-btn" 
                    onClick={() => handleRatingSelect(0)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Edit / Add Review button */}
            <button className="write-review-btn" onClick={() => setShowLogModal(true)}>
              {isBookLogged ? 'EDIT LOG / REVIEW...' : 'WRITE A REVIEW...'}
            </button>

            {/* Add to Custom Lists checklist section */}
            <div className="panel-lists-section">
              <label>ADD TO LISTS</label>
              {lists.length > 0 ? (
                <div className="panel-lists-list">
                  {lists.map((list) => {
                    const isInList = list.books?.some(b => b.volumeId === id)
                    return (
                      <label key={list.id} className="panel-list-item-label">
                        <input 
                          type="checkbox"
                          checked={isInList || false}
                          onChange={async (e) => {
                            if (onAssignToList) {
                              await onAssignToList(user, list.id, book || { id, volumeId: id }, !isInList)
                            }
                          }}
                        />
                        <span className="panel-list-name">{list.name}</span>
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
      </div>

      {showLogModal && (
        <LogModal 
          book={book} 
          onSave={handleSaveLog} 
          onCancel={() => setShowLogModal(false)}
          initialData={userLog || {}}
        />
      )}
    </div>
  )
}
