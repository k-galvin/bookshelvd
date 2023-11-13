import { useState, useEffect } from 'react'
import { fetchLoggedBooks } from '../services/bookService'

export default function BookLogPage({ user }) {
  const [loggedBooks, setLoggedBooks] = useState([])

  // Fetch all books in the log
  useEffect(() => {
    if (user) {
      fetchLoggedBooks(user.uid).then(setLoggedBooks)
    }
  }, [user])

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
            </li>
          ))}
        </ul>
      ) : (
        'No Logged Books'
      )}
    </div>
  )
}
