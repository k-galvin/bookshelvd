import { useState, useEffect } from 'react'

export default function Book({ book, loggedBooks, addBook, deleteBook, user, cover, title }) {
  const [isBookLogged, setIsBookLogged] = useState(false)

  useEffect(() => {
    if (loggedBooks) {
      setIsBookLogged(loggedBooks.some(loggedBook => loggedBook.id === book.id))
    }
  }, [loggedBooks, book])

  return (
    <div className="book-container">
      {cover ? (
        <>
          <img src={cover} className="cover-img" alt={`${title} Cover`} />
          <div>
            {isBookLogged ? (
              <span
                onClick={() => {
                  deleteBook(user, book)
                  setIsBookLogged(false)
                }}
                className="overlay-icon red"
              >
                &#x2716; {/* 'x' character */}
              </span>
            ) : (
              <span
                onClick={() => {
                  addBook(user, book)
                  setIsBookLogged(true)
                }}
                className="overlay-icon green"
              >
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
