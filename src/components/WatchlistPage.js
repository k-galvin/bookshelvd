import Book from './Book'
import LoginPage from './LoginPage'

export default function WatchlistPage({ user, loggedBooks, watchlist, addBook, deleteBook, handleAddToWatchlist }) {
  if (!user) return <LoginPage />

  return (
    <div className="book-log-page">
      <div className="book-log-header">
        <h2 className="book-log-title">YOU WANT TO READ...</h2>
      </div>

      {watchlist.length > 0 ? (
        <div className="books-container">
          {watchlist.map(book => (
            <div key={book.volumeId} className="small-book-container">
              <Book
                book={{...book, id: book.volumeId}}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                watchlist={watchlist}
                addBook={addBook}
                deleteBook={deleteBook}
                user={user}
                addToWatchlist={handleAddToWatchlist}
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
