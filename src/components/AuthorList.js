import Book from './Book'

export default function AuthorList({ authorBooks, loggedBooks, addBook, deleteBook, user, addToWatchlist }) {
  return authorBooks && authorBooks.length > 0 ? (
    // Display five books by the selected author if available
    <div className="books-container home">
      {authorBooks.slice(0, 5).map(book => (
        <div key={book.id}>
          <Book
            book={book}
            cover={
              book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail
                ? book.volumeInfo.imageLinks.smallThumbnail
                : null
            }
            loggedBooks={loggedBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            addToWatchlist={addToWatchlist}
            title={book.volumeInfo.title}
            size="large"
            authors={book.volumeInfo.authors}
            description={book.volumeInfo.description}
            averageRating={book.volumeInfo.averageRating}
          />
        </div>
      ))}
    </div>
  ) : (
    'No results'
  )
}
