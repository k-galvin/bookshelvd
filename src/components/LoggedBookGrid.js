import Book from './Book'

export default function LoggedBookGrid({ books, addBook, deleteBook, user, loggedBooks, loading }) {
  return (
    <div>
      {loading ? (
        <div className="books-container">Loading...</div>
      ) : (
        <div>
          {books ? (
            <div className="books-container">
              {books.map(book => (
                <div key={book.id} className="small-book-container">
                  <Book
                    book={book}
                    cover={book.thumbnail}
                    loggedBooks={loggedBooks}
                    addBook={addBook}
                    deleteBook={deleteBook}
                    user={user}
                    title={book.title}
                    authors={book.authors}
                    description={book.description}
                    averageRating={book.averageRating}
                  />
                </div>
              ))}
            </div>
          ) : (
            'No logged books'
          )}
        </div>
      )}
    </div>
  )
}
