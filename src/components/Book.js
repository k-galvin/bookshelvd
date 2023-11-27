import { useState, useEffect } from 'react'

export default function Book({ book, loggedBooks, addBook, deleteBook, user, cover, title, size }) {
  const [isBookLogged, setIsBookLogged] = useState(false)

  useEffect(() => {
    if (loggedBooks) {
      setIsBookLogged(loggedBooks.some(loggedBook => loggedBook.id === book.id))
    }
  }, [loggedBooks, book])

  const getSizeStyle = () => {
    if (size === 'large') {
      return { width: '160px', height: '230px' } // Set your small size styles
    } else {
      return { width: '80px', height: '120px' } // Set your large size styles
    }
  }

  const sizeStyle = getSizeStyle()

  return (
    <div className="book-container">
      <div className="cover-container" style={sizeStyle}>
        <img src={cover} className="cover-img" alt={`${title}`} style={sizeStyle} />
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
      </div>
    </div>
  )
}
