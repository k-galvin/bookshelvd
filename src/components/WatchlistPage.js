import { useState, useEffect } from 'react'
import { fetchWatchlist, removeFromWatchlist } from '../services/bookService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function WatchlistPage({ user, loggedBooks, addBook, deleteBook }) {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getWatchlist() {
      if (user) {
        try {
          const books = await fetchWatchlist(user.uid)
          setWatchlist(books)
        } catch (error) {
          console.error("Error fetching watchlist:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    getWatchlist()
  }, [user])

  const handleRemove = async (volumeId) => {
    try {
      await removeFromWatchlist(user, volumeId)
      setWatchlist(watchlist.filter(b => b.volumeId !== volumeId))
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  if (!user) return <LoginPage />

  return (
    <div className="book-log-page">
      <div className="book-log-header">
        <h2 className="book-log-title">YOU WANT TO READ...</h2>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : watchlist.length > 0 ? (
        <div className="books-container">
          {watchlist.map(book => (
            <div key={book.volumeId} className="small-book-container">
              <Book
                book={book}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                user={user}
                title={book.title}
                authors={book.authors}
                size="small"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="books-grid-container">Your watchlist is empty.</div>
      )}
    </div>
  )
}
