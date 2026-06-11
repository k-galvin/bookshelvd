import { Link } from 'react-router-dom'
import Book from './Book'
import LoginPage from './LoginPage'
import ProfileHeader from './ProfileHeader'

export default function LikedPage({ user, loggedBooks = [], tbr = [], addBook, deleteBook, updateBook, handleAddToTBR, lists = [], onAssignToList, onMarkAsRead, onUpdateBookRating }) {
  if (!user) return <LoginPage />

  const likedBooks = loggedBooks.filter(book => book.isLiked)

  return (
    <div className="book-log-page">
      <ProfileHeader user={user} />
      <div className="book-log-header">
        <h2 className="book-log-title">LIKED BOOKS</h2>
        <span className="diary-total-count">{likedBooks.length} book(s)</span>
      </div>

      {likedBooks.length > 0 ? (
        <div className="books-container">
          {likedBooks.map(book => (
            <div key={book.volumeId}>
              <Book
                book={{...book, id: book.volumeId}}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                tbr={tbr}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                addToTBR={handleAddToTBR}
                title={book.title}
                authors={book.authors}
                size="small"
                lists={lists}
                onAssignToList={onAssignToList}
                onMarkAsRead={onMarkAsRead}
                onUpdateBookRating={onUpdateBookRating}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card">
          <p>You haven't liked any books yet. Click the heart button on a book cover to like it!</p>
          <Link to="/book-search?q=popular" className="dashboard-link-btn" style={{ textDecoration: 'none' }}>Search Books</Link>
        </div>
      )}
    </div>
  )
}
