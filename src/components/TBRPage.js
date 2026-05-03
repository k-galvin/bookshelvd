import Book from './Book'
import LoginPage from './LoginPage'

export default function TBRPage({ user, loggedBooks, tbr, addBook, deleteBook, handleAddToTBR }) {
  if (!user) return <LoginPage />

  return (
    <div className="book-log-page">
      <div className="book-log-header">
        <h2 className="book-log-title">YOUR TBR...</h2>
      </div>

      {tbr && tbr.length > 0 ? (
        <div className="books-container">
          {tbr.map(book => (
            <div key={book.volumeId} className="small-book-container">
              <Book
                book={{...book, id: book.volumeId}}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                tbr={tbr}
                addBook={addBook}
                deleteBook={deleteBook}
                user={user}
                addToTBR={handleAddToTBR}
                title={book.title}
                authors={book.authors}
                size="small"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="books-grid-container">Your TBR is empty.</div>
      )}
    </div>
  )
}
