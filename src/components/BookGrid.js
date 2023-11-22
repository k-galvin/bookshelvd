import Book from './Book'

export default function BookGrid({ books, addBook, deleteBook, user, loggedBooks }) {
  return (
    <div>
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
