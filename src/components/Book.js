export default function Book({ book, loggedBooks, addBook, deleteBook, user, cover, title }) {
  const isBookLogged = loggedBooks.some(loggedBook => loggedBook.id === book.id)

  return (
    <div className="book-container">
      {cover ? (
        <>
          <img src={cover} className="cover-img" alt={`${title} Cover`} />
          <div>
            {isBookLogged ? (
              <span onClick={() => deleteBook(user, book)} className="overlay-icon red">
                &#x2716; {/* 'x' character */}
              </span>
            ) : (
              <span onClick={() => addBook(user, book)} className="overlay-icon green">
                &#10003; {/* Checkmark */}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="alt-cover">{title}</div>
      )}
    </div>
  )
}
