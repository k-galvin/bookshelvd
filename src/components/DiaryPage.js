import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginPage from './LoginPage'
import StarRating from './StarRating'
import LogModal from './LogModal'
import ProfileHeader from './ProfileHeader'

export default function DiaryPage({ user, loggedBooks = [], deleteBook, updateBook }) {
  const [editingLog, setEditingLog] = useState(null)

  if (!user) return <LoginPage />

  // Filter out read logs that are not logged to a specific date (dateRead !== null)
  const sortedDiary = [...loggedBooks]
    .filter(book => book.dateRead !== null)
    .sort((a, b) => {
      const timeA = a.dateRead?.toMillis ? a.dateRead.toMillis() : new Date(a.dateRead || a.createdAt).getTime()
      const timeB = b.dateRead?.toMillis ? b.dateRead.toMillis() : new Date(b.dateRead || b.createdAt).getTime()
      return timeB - timeA
    })

  const handleEditClick = (log) => {
    setEditingLog(log)
  }

  const handleSaveEdit = (logDetails) => {
    if (editingLog) {
      updateBook(user, editingLog.id, logDetails)
      setEditingLog(null)
    }
  }

  return (
    <div className="diary-page-container">
      <ProfileHeader user={user} />
      <div className="book-log-header">
        <h2 className="book-log-title">YOUR DIARY</h2>
        <span className="diary-total-count">{loggedBooks.length} entry/entries</span>
      </div>

      {sortedDiary.length > 0 ? (
        <div className="diary-table-wrapper">
          <table className="diary-table">
            <thead>
              <tr>
                <th className="th-date">MONTH</th>
                <th className="th-day">DAY</th>
                <th className="th-cover">COVER</th>
                <th className="th-title">TITLE & RELEASE YEAR</th>
                <th className="th-rating">RATING</th>
                <th className="th-like">LIKE</th>
                <th className="th-reread">REREAD</th>
                <th className="th-review">REVIEW</th>
                <th className="th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sortedDiary.map((log, index) => {
                const jsDate = log.dateRead?.toDate ? log.dateRead.toDate() : new Date(log.dateRead || log.createdAt)
                const month = jsDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()
                const day = jsDate.toLocaleDateString(undefined, { day: '2-digit' })
                const year = jsDate.getFullYear()
                const volumeYear = log.originalYear || log.publishedDate?.split('-')[0]

                // Only display month and year for the first entry of that month
                const currentMonthYear = `${month} ${year}`
                const prevLog = index > 0 ? sortedDiary[index - 1] : null
                const prevDate = prevLog 
                  ? (prevLog.dateRead?.toDate ? prevLog.dateRead.toDate() : new Date(prevLog.dateRead || prevLog.createdAt))
                  : null
                const prevMonthYear = prevDate 
                  ? `${prevDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()} ${prevDate.getFullYear()}`
                  : null
                const showMonthYear = currentMonthYear !== prevMonthYear

                return (
                  <tr key={log.id}>
                    <td className="td-month">{showMonthYear ? currentMonthYear : ''}</td>
                    <td className="td-day">{day}</td>
                    <td className="td-cover">
                      <Link to={`/book/${log.volumeId}`}>
                        <img src={log.thumbnail || '/placeholder-cover.png'} alt={log.title} className="diary-row-cover" />
                      </Link>
                    </td>
                    <td className="td-title">
                      <div className="diary-title-container">
                        <Link to={`/book/${log.volumeId}`} className="diary-book-title">{log.title}</Link>
                        {volumeYear && <span className="diary-book-year">{volumeYear}</span>}
                        <span className="diary-book-author">By {log.authors?.join(', ')}</span>
                      </div>
                    </td>
                    <td className="td-rating">
                      {log.userRating > 0 ? (
                        <StarRating rating={log.userRating} size="small" />
                      ) : (
                        <span className="no-rating">-</span>
                      )}
                    </td>
                    <td className="td-like">
                      {log.isLiked ? (
                        <span className="material-symbols-outlined heart-active">favorite</span>
                      ) : (
                        <span className="heart-empty">-</span>
                      )}
                    </td>
                    <td className="td-reread">
                      {(() => {
                        const dynamicCount = loggedBooks.filter(b => b.volumeId === log.volumeId).length;
                        return dynamicCount > 1 ? (
                          <span className="reread-indicator-badge" title={`Read ${dynamicCount} times`}>
                            <span className="material-symbols-outlined reread-icon">repeat</span>
                            <span className="reread-count-val">{dynamicCount}</span>
                          </span>
                        ) : (
                          <span className="no-reread">-</span>
                        );
                      })()}
                    </td>
                    <td className="td-review">
                      {log.userReview ? (
                        <span 
                          className="material-symbols-outlined review-icon-badge"
                          title={log.userReview}
                        >
                          chat_bubble
                        </span>
                      ) : (
                        <span className="no-review">-</span>
                      )}
                    </td>
                    <td className="td-actions">
                      <button 
                        className="diary-action-btn edit-btn" 
                        onClick={() => handleEditClick(log)}
                        title="Edit Log"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        className="diary-action-btn delete-btn" 
                        onClick={() => deleteBook(user, log)}
                        title="Delete Log"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <p>Your diary is empty. Start logging books you read to build your timeline!</p>
          <Link to="/book-search?q=popular" className="dashboard-link-btn">Search Books</Link>
        </div>
      )}

      {editingLog && (
        <LogModal
          book={{
            id: editingLog.volumeId,
            volumeInfo: {
              title: editingLog.title,
              authors: editingLog.authors,
              imageLinks: { thumbnail: editingLog.thumbnail }
            }
          }}
          onSave={handleSaveEdit}
          onCancel={() => setEditingLog(null)}
          initialData={editingLog}
          allowNewLog={false}
        />
      )}
    </div>
  )
}
