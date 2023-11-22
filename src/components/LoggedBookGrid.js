import Book from './Book'

export default function LoggedBookGrid({ books, addBook, deleteBook, user, loggedBooks, cover, title }) {
  return (
    <div className="logged-books-container">
      {books.map(book => (
        <div key={book.id}>
          <Book
            book={book}
            cover={book.thumbnail}
            loggedBooks={loggedBooks}
            addBook={addBook}
            deleteBook={deleteBook}
            user={user}
            title={book.title}
          />
        </div>
      ))}
    </div>
  )
}
