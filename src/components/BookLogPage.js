export default function BookLogPage({ user, deleteBook, loggedBooks }) {
  return (
    <div>
      <h2>Logged Books</h2>

      {/* Display logged books */}
      {loggedBooks ? (
        <ul>
          {loggedBooks.map(book => (
            <li key={book.id}>
              <div className="book-container">
                {book.thumbnail ? (
                  <img src={book.thumbnail} className="cover-img" alt={`${book.title} Cover`} />
                ) : (
                  <div className="alt-cover">{book.title}</div>
                )}

                {/* Button to remove a book from log */}
                <button onClick={() => deleteBook(user, book)} className="remove-button">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        'No Logged Books'
      )}
    </div>
  )
}
