import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchBookById } from '../services/apiService'
import LogModal from './LogModal'
import LoginPage from './LoginPage'

export default function BookDetailPage({ user, loggedBooks, tbr, addBook, deleteBook, addToTBR }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
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
      const loggedInstance = loggedBooks.find(lb => lb.volumeId === id);
      setIsBookLogged(!!loggedInstance)
      setUserLog(loggedInstance || null)
    }
    if (tbr && id) {
      setIsInTBR(tbr.some(b => b.volumeId === id))
    }
  }, [loggedBooks, tbr, id])

  const handleSaveLog = (logDetails) => {
    addBook(user, book, logDetails)
    setShowLogModal(false)
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
    info.imageLinks?.extraLarge || 
    info.imageLinks?.large || 
    info.imageLinks?.medium || 
    info.imageLinks?.thumbnail || 
    info.imageLinks?.smallThumbnail
  ) || 'https://via.placeholder.com/300x450?text=No+Cover+Available';

  return (
    <div className="book-detail-page">
      {/* Backdrop */}
      <div className="backdrop-container">
        <div 
          className="backdrop-image" 
          style={{ backgroundImage: `url(${cover})` }}
        ></div>
        <div className="backdrop-overlay"></div>
      </div>

      <div className="book-detail-content">
        <div className="detail-left">
          <div className="large-cover-container">
            <img src={cover} alt={info.title} />
          </div>
          
          <div className="page-rating-container">
            <div className="star-rating page-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={`star ${(userLog?.userRating || 0) >= star ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-center">
          <h1 className="book-page-title">{info.title}</h1>
          <div className="book-page-meta">
            <span className="release-year">{info.publishedDate?.split('-')[0]}</span>
            <span className="meta-separator">By</span>
            <span className="author-names">{info.authors?.join(', ')}</span>
          </div>
          
          <div className="book-page-description">
            {info.description?.replace(/<[^>]*>/g, '') || "No description available."}
          </div>

          {userLog && (
            <div className="user-review-section">
              <h3>YOUR REVIEW</h3>
              <div className="user-rating-display">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`small-star ${i < userLog.userRating ? 'filled' : ''}`}>★</span>
                ))}
                {userLog.isLiked && <span className="material-symbols-outlined small-heart-icon">favorite</span>}
              </div>
              <p className="user-review-text">{userLog.userReview || "No written review."}</p>
            </div>
          )}
        </div>

        <div className="detail-right">
          <div className="action-panel">
            <div 
              className={`panel-action ${isBookLogged ? 'active' : ''}`}
              onClick={() => isBookLogged ? deleteBook(user, userLog) : setShowLogModal(true)}
            >
              <span className="material-symbols-outlined">{isBookLogged ? 'done' : 'visibility'}</span>
              <span>{isBookLogged ? 'Read' : 'Read'}</span>
            </div>
            
            <div 
              className={`panel-action ${userLog?.isLiked ? 'active' : ''}`}
              onClick={() => {/* update like */}}
            >
              <span className="material-symbols-outlined">favorite</span>
              <span>Like</span>
            </div>

            <div 
              className={`panel-action ${isInTBR ? 'active-blue' : ''}`}
              onClick={() => addToTBR(user, book)}
            >
              <span className="material-symbols-outlined">schedule</span>
              <span>TBR</span>
            </div>
          </div>
        </div>
      </div>

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
