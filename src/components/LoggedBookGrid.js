import Book from './Book'

export default function LoggedBookGrid({ books, addBook, deleteBook, user, loggedBooks }) {
  return (
    <div>
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
    </div>
  )
}
