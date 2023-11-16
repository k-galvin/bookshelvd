export default function BookLogPage({ user, deleteBook, loggedBooks }) {
  return (
    <div>
      <h2>Logged Books</h2>

      {/* Display logged books */}
      {loggedBooks ? (
        <ul>
          {loggedBooks.map(book => (
            <li key={book.id}>
              {book.title}
              {book.thumbnail && <img src={book.thumbnail} alt={`${book.title} Cover`} />}
              {!book.thumbnail && <span>No image available</span>}

              {/* Button to remove a book from log */}
              <button onClick={() => deleteBook(user, book)}>Remove from Read</button>
            </li>
          ))}
        </ul>
      ) : (
        'No Logged Books'
      )}
    </div>
  )
}
