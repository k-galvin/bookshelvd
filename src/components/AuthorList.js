import Book from './Book'

export default function AuthorList({ authorBooks, loggedBooks, addBook, deleteBook, user }) {
  return authorBooks && authorBooks.length > 0 ? (
    <div className="books-container">
      {authorBooks.slice(0, 5).map(book => (
        <div key={book.id} className="large-book-container">
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
