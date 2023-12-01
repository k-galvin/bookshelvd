import { useState, useEffect } from 'react'
import BookInfo from './BookInfo'

export default function Book({
  book,
  loggedBooks,
  addBook,
  deleteBook,
  user,
  cover,
  title,
  size,
  authors,
  description,
  averageRating
}) {
  const [isBookLogged, setIsBookLogged] = useState(false)
  const [displayInfo, setDisplayInfo] = useState(false)

  // Update whether a book has been logged
  useEffect(() => {
    if (loggedBooks) {
      setIsBookLogged(loggedBooks.some(loggedBook => loggedBook.id === book.id))
    }
  }, [loggedBooks, book])

  // Determine if a book show be displayed in a large or small size
  const getSizeStyle = () => {
    if (size === 'large') {
      return { width: '160px', height: '230px' }
    } else {
      return { width: '80px', height: '120px' }
    }
  }

  const sizeStyle = getSizeStyle()

  return (
    <div>
      {/* Display a book's cover, or if not available, its title */}
      <div className="cover-container" style={sizeStyle}>
        <img
          src={cover}
          className="cover-img"
          alt={`${title}`}
          style={sizeStyle}
          // Open popup when book cover is clicked
          onClick={() => {
            setDisplayInfo(true)
          }}
        />

        {/* Display add/remove book overlay in top right of each book */}
        <div>
          {isBookLogged ? (
            // Remove book overlay button
            <span
              onClick={() => {
                deleteBook(user, book)
                setIsBookLogged(false)
              }}
              className="overlay-icon red"
            >
              ✖
            </span>
          ) : (
            // Add book overlay button
            <span
              onClick={() => {
                addBook(user, book)
                setIsBookLogged(true)
              }}
              className="overlay-icon green"
            >
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Popup of book info shown when book cover is clicked */}
      {displayInfo ? (
        <BookInfo
          setDisplayInfo={setDisplayInfo}
          title={title}
          authors={authors}
          description={description}
          averageRating={averageRating}
        />
      ) : (
        ''
      )}
    </div>
  )
}
