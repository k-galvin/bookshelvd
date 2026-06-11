import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchBooks } from '../services/apiService'
import LoginPage from './LoginPage'
import StarRating from './StarRating'
import ProfileHeader from './ProfileHeader'
import TopAuthorsChart from './TopAuthorsChart'
import MonthlyReadingChart from './MonthlyReadingChart'

export default function ProfilePage({ user, loggedBooks = [], tbr = [], favorites = [], updateFavorites }) {
  const [showEditFavs, setShowEditFavs] = useState(false)
  const [tempFavs, setTempFavs] = useState([...favorites])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)

  useEffect(() => {
    setTempFavs([...favorites])
  }, [favorites])

  if (!user) return <LoginPage />

  // Calculate statistics
  const totalBooks = loggedBooks.length
  const totalPages = loggedBooks.reduce((acc, b) => acc + (parseInt(b.pageCount, 10) || 0), 0)
  const totalLikes = loggedBooks.filter(b => b.isLiked).length
  const totalReviews = loggedBooks.filter(b => b.userReview && b.userReview.trim()).length

  // Sort logged books for recent activity
  const sortedLoggedBooks = [...loggedBooks].sort((a, b) => {
    const timeA = a.dateRead?.toMillis ? a.dateRead.toMillis() : new Date(a.dateRead || a.createdAt).getTime()
    const timeB = b.dateRead?.toMillis ? b.dateRead.toMillis() : new Date(b.dateRead || b.createdAt).getTime()
    return timeB - timeA
  })
  const recentLogs = sortedLoggedBooks.slice(0, 3)

  // Compute ratings histogram data (0.5 to 5.0 in steps of 0.5)
  const ratingSteps = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
  const ratingCounts = {}
  ratingSteps.forEach(step => {
    ratingCounts[step] = 0
  })

  // Group user ratings
  loggedBooks.forEach(book => {
    const rating = parseFloat(book.userRating)
    if (rating > 0) {
      // Find the closest step (dealing with float issues)
      const closestStep = ratingSteps.find(step => Math.abs(step - rating) < 0.25)
      if (closestStep) {
        ratingCounts[closestStep]++
      }
    }
  })

  const maxCount = Math.max(...Object.values(ratingCounts), 1)

  // Search favorites
  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const results = await searchBooks(searchQuery.trim())
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  const selectFavorite = (book) => {
    if (activeSlot === null) return
    const info = book.volumeInfo
    const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
    const formattedBook = {
      volumeId: book.id || book.volumeId,
      title: info.title,
      thumbnail: cover.replace('http://', 'https://'),
      authors: info.authors || []
    }
    const newFavs = [...tempFavs]
    newFavs[activeSlot] = formattedBook
    setTempFavs(newFavs)
    setActiveSlot(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const removeFavorite = (slotIndex) => {
    const newFavs = [...tempFavs]
    newFavs[slotIndex] = null
    setTempFavs(newFavs)
  }

  const handleSaveFavorites = () => {
    // Filter out null values for the save array, or keep indices
    const cleanedFavs = tempFavs.filter(Boolean)
    updateFavorites(cleanedFavs)
    setShowEditFavs(false)
  }

  // Ensure favorites array always has length 4 for rendering slots
  const renderFavs = [...favorites]
  while (renderFavs.length < 4) {
    renderFavs.push(null)
  }

  const editFavsSlots = [...tempFavs]
  while (editFavsSlots.length < 4) {
    editFavsSlots.push(null)
  }

  return (
    <div className="profile-page-container">
      <ProfileHeader user={user} />
      {/* Profile Header Stats */}
      <div className="profile-header">
        <div className="profile-user-info">
          <h2>{user.displayName || 'Reader'}</h2>
          <span className="profile-member-date">Member since 2026</span>
        </div>
        <div className="profile-stats-bar">
          <div className="profile-stat-item">
            <span className="stat-num">{totalBooks}</span>
            <span className="stat-lbl">Books Read</span>
          </div>
          <div className="profile-stat-item">
            <span className="stat-num">{totalPages.toLocaleString()}</span>
            <span className="stat-lbl">Pages Read</span>
          </div>
          <div className="profile-stat-item">
            <span className="stat-num">{totalLikes}</span>
            <span className="stat-lbl">Likes</span>
          </div>
          <div className="profile-stat-item">
            <span className="stat-num">{totalReviews}</span>
            <span className="stat-lbl">Reviews</span>
          </div>
        </div>
      </div>

      <div className="profile-body-layout">
        {/* Left column: Favorites & Activity */}
        <div className="profile-left-main">
          {/* Favorites shelf */}
          <div className="profile-sectionfavorites">
            <div className="section-header-row">
              <h3 className="section-title-underlined">FOUR FAVORITES</h3>
              <button className="edit-favorites-trigger" onClick={() => setShowEditFavs(true)}>
                Edit Favorites
              </button>
            </div>
            
            <div className="favorites-shelf-display">
              {renderFavs.map((fav, idx) => (
                <div key={fav ? fav.volumeId : `empty-${idx}`} className="favorite-shelf-slot">
                  {fav ? (
                    <Link to={`/book/${fav.volumeId}`} className="fav-cover-link" title={fav.title}>
                      <img src={fav.thumbnail} alt={fav.title} className="fav-cover-img" />
                    </Link>
                  ) : (
                    <div className="empty-fav-slot" onClick={() => { setShowEditFavs(true); setActiveSlot(idx); }}>
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="profile-section-activity">
            <h3 className="section-title-underlined">RECENT ACTIVITY</h3>
            {recentLogs.length > 0 ? (
              <div className="profile-activity-list">
                {recentLogs.map(log => {
                  const readDate = log.dateRead?.toDate 
                    ? log.dateRead.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(log.dateRead || log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    
                  return (
                    <div key={log.id} className="profile-activity-card">
                      <Link to={`/book/${log.volumeId}`} className="profile-activity-cover">
                        <img src={log.thumbnail || '/placeholder-cover.png'} alt={log.title} />
                      </Link>
                      <div className="profile-activity-details">
                        <div className="profile-activity-header">
                          <Link to={`/book/${log.volumeId}`} className="profile-activity-title">{log.title}</Link>
                          <span className="profile-activity-date">Read {readDate}</span>
                        </div>
                        <div className="profile-activity-meta">
                          {log.userRating > 0 && <StarRating rating={log.userRating} size="small" />}
                          {log.isLiked && <span className="material-symbols-outlined activity-heart">favorite</span>}
                          {(() => {
                            const dynamicCount = loggedBooks.filter(b => b.volumeId === log.volumeId).length;
                            return dynamicCount > 1 ? (
                              <span className="reread-badge-indicator" title={`Read ${dynamicCount} times`}>
                                <span className="material-symbols-outlined reread-icon">repeat</span>
                                <span className="reread-count-val">{dynamicCount}</span>
                              </span>
                            ) : null;
                          })()}
                        </div>
                        {log.userReview && <p className="profile-activity-review">"{log.userReview}"</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="empty-text">No books logged yet.</p>
            )}
          </div>

          {/* Charts Section */}
          <div className="profile-section-charts" style={{ marginTop: '2.5em' }}>
            <h3 className="section-title-underlined">READING ANALYTICS</h3>
            <div className="profile-charts-grid">
              <TopAuthorsChart loggedBooks={loggedBooks} />
              <MonthlyReadingChart loggedBooks={loggedBooks} />
            </div>
          </div>
        </div>

        {/* Right column: Ratings Histogram & TBR */}
        <aside className="profile-right-sidebar">
          {/* Ratings Histogram */}
          <div className="profile-card ratings-histogram-card">
            <h4>RATINGS DISTRIBUTION</h4>
            <div className="histogram-container">
              <div className="histogram-bars">
                {ratingSteps.map(step => {
                  const count = ratingCounts[step]
                  const percent = (count / maxCount) * 100
                  return (
                    <div key={step} className="histogram-bar-col" title={`${count} rating(s) of ${step}`}>
                      <div className="histogram-bar-track">
                        <div 
                          className="histogram-bar-fill" 
                          style={{ height: `${percent}%` }}
                        />
                      </div>
                      <span className="histogram-bar-label">
                        {step % 1 === 0 ? step : '½'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* TBR Preview */}
          <div className="profile-card tbr-preview-card">
            <div className="card-header-row">
              <h4>TBR</h4>
              <Link to="/tbr" className="view-all-link">ALL ({tbr.length})</Link>
            </div>
            {tbr.length > 0 ? (
              <div className="tbr-preview-grid">
                {tbr.slice(0, 4).map(book => (
                  <Link key={book.volumeId} to={`/book/${book.volumeId}`} className="tbr-preview-item" title={book.title}>
                    <img src={book.thumbnail || '/placeholder-cover.png'} alt={book.title} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-text">Your TBR is empty.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Edit Favorites Modal */}
      {showEditFavs && (
        <div className="popup" onClick={() => setShowEditFavs(false)}>
          <div className="popup-content favs-edit-modal" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined close-modal-icon" onClick={() => setShowEditFavs(false)}>
              close
            </span>
            <h3>CHOOSE YOUR FAVORITE BOOKS</h3>
            <p className="favs-modal-subtitle">Search Google Books to assign titles to your four profile slots.</p>

            <div className="favs-modal-slots-row">
              {editFavsSlots.map((fav, idx) => (
                <div 
                  key={idx} 
                  className={`favs-modal-slot ${activeSlot === idx ? 'active-selection' : ''}`}
                  onClick={() => setActiveSlot(idx)}
                >
                  <span className="slot-number">{idx + 1}</span>
                  {fav ? (
                    <div className="slot-cover-wrap">
                      <img src={fav.thumbnail} alt={fav.title} />
                      <span 
                        className="material-symbols-outlined remove-slot-fav"
                        onClick={(e) => { e.stopPropagation(); removeFavorite(idx); }}
                        title="Remove"
                      >
                        cancel
                      </span>
                    </div>
                  ) : (
                    <div className="slot-empty-indicator">
                      <span className="material-symbols-outlined">search</span>
                      <span>Select</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeSlot !== null && (
              <div className="fav-search-subform">
                <h4>Search for slot {activeSlot + 1}:</h4>
                <form onSubmit={handleSearchSubmit} className="fav-search-bar">
                  <input
                    type="text"
                    placeholder="Enter book title or author..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="log-input"
                    autoFocus
                  />
                  <button type="submit" className="save-btn">SEARCH</button>
                </form>

                {searchLoading && (
                  <div className="spinner-container small">
                    <div className="spinner"></div>
                  </div>
                )}

                <div className="fav-search-results-list">
                  {searchResults.slice(0, 5).map(result => {
                    const info = result.volumeInfo
                    const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
                    return (
                      <div 
                        key={result.id} 
                        className="fav-search-result-row"
                        onClick={() => selectFavorite(result)}
                      >
                        <img src={cover} alt={info.title} className="fav-res-cover" />
                        <div className="fav-res-info">
                          <span className="fav-res-title">{info.title}</span>
                          <span className="fav-res-author">{info.authors?.join(', ')}</span>
                        </div>
                      </div>
                    )
                  })}
                  {searchResults.length === 0 && searchQuery && !searchLoading && (
                    <div className="no-results">No books found.</div>
                  )}
                </div>
              </div>
            )}

            <div className="log-modal-actions" style={{ marginTop: '2em' }}>
              <button type="button" className="cancel-btn" onClick={() => setShowEditFavs(false)}>
                CANCEL
              </button>
              <button type="button" className="save-btn" onClick={handleSaveFavorites}>
                SAVE FAVORITES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
