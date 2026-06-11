import { Link } from 'react-router-dom'
import LoginPage from './LoginPage'
import StarRating from './StarRating'
import TopAuthorsChart from './TopAuthorsChart'
import MonthlyReadingChart from './MonthlyReadingChart'

export default function Home({ user, addBook, deleteBook, updateBook, loggedBooks = [], tbr = [], addToTBR }) {
  // Display login page if not signed in
  if (!user) {
    return <LoginPage />
  }

  // Calculate user statistics
  const totalBooks = loggedBooks.length
  const totalPages = loggedBooks.reduce((acc, b) => acc + (parseInt(b.pageCount, 10) || 0), 0)
  
  const ratedBooks = loggedBooks.filter(b => b.userRating > 0)
  const avgRating = ratedBooks.length > 0 
    ? (ratedBooks.reduce((acc, b) => acc + b.userRating, 0) / ratedBooks.length).toFixed(1)
    : '0.0'
    
  const totalLikes = loggedBooks.filter(b => b.isLiked).length

  // Sort logged books by read date (or creation date) descending for recent activity
  const sortedLoggedBooks = [...loggedBooks].sort((a, b) => {
    const timeA = a.dateRead?.toMillis ? a.dateRead.toMillis() : new Date(a.dateRead || a.createdAt).getTime();
    const timeB = b.dateRead?.toMillis ? b.dateRead.toMillis() : new Date(b.dateRead || b.createdAt).getTime();
    return timeB - timeA;
  })
  
  const recentLogs = sortedLoggedBooks.slice(0, 3)

  return (
    <div className="home-page dashboard-layout">
      <div className="dashboard-main">
        {/* Welcome Header */}
        <section className="dashboard-welcome">
          <h2>Welcome back, {user.displayName || 'Reader'}!</h2>
        </section>

        {/* Recent Activity Section */}
        <section className="dashboard-recent">
          <h3 className="section-title-underlined">Recent Activity</h3>
          {recentLogs.length > 0 ? (
            <div className="recent-logs-list">
              {recentLogs.map(log => {
                const readDate = log.dateRead?.toDate 
                  ? log.dateRead.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date(log.dateRead || log.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                  
                return (
                  <div key={log.id} className="recent-log-card">
                    <Link to={`/book/${log.volumeId}`} className="recent-log-cover">
                      <img src={log.thumbnail || '/placeholder-cover.png'} alt={log.title} />
                    </Link>
                    <div className="recent-log-details">
                      <div className="recent-log-header">
                        <Link to={`/book/${log.volumeId}`} className="recent-log-title">{log.title}</Link>
                        <span className="recent-log-date">Read {readDate}</span>
                      </div>
                      <div className="recent-log-rating-row">
                        {log.userRating > 0 && <StarRating rating={log.userRating} size="small" />}
                        {log.isLiked && <span className="material-symbols-outlined recent-heart">favorite</span>}
                      </div>
                      {log.userReview && (
                        <p className="recent-log-review">"{log.userReview.substring(0, 180)}{log.userReview.length > 180 ? '...' : ''}"</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state-card">
              <p>You haven't logged any books yet.</p>
              <Link to="/book-search?q=popular" className="dashboard-link-btn">Search and log your first book</Link>
            </div>
          )}
        </section>

        {/* Charts Section */}
        <section className="dashboard-charts-section">
          <h3 className="section-title-underlined">Your Reading Journey</h3>
          <div className="dashboard-charts-grid">
            <TopAuthorsChart loggedBooks={loggedBooks} />
            <MonthlyReadingChart loggedBooks={loggedBooks} />
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <aside className="dashboard-sidebar">
        {/* Stats Card */}
        <div className="dashboard-card stats-card">
          <h4>YOUR STATS</h4>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-num">{totalBooks}</span>
              <span className="stat-lbl">Books</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{totalPages.toLocaleString()}</span>
              <span className="stat-lbl">Pages</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{avgRating}</span>
              <span className="stat-lbl">Avg Rating</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{totalLikes}</span>
              <span className="stat-lbl">Likes</span>
            </div>
          </div>
        </div>

        {/* TBR Preview Card */}
        <div className="dashboard-card tbr-card">
          <div className="card-header-row">
            <h4>TBR</h4>
            <Link to="/tbr" className="view-all-link">ALL</Link>
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
            <div className="empty-tbr-box">
              <p>Your TBR is empty.</p>
              <Link to="/books" className="text-link">Browse books</Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}


