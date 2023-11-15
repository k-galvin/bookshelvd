import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import { logBook } from '../services/bookService'

export default function BookSearchPage({ user }) {
  const [query, setQuery] = useState('')
  const [queriedBooks, setQueriedBooks] = useState([])

  useEffect(() => {
    // Function to handle the book search
    const handleSearch = () => {
      if (query.trim() !== '') {
        searchBooks(query, setQueriedBooks)
      } else {
        // If the query is empty, set the queried books to an empty array
        setQueriedBooks([])
      }
    }

    // Call handleSearch on initial render to fetch books without delay
    handleSearch()
  }, [query])

  // Handling function for logging a new book
  const handleLogBook = (user, book) => {
    logBook(user, book)
  }

  return (
    <div>
      {/* Get the query from user input */}
      {/* Search through the volumes according to user input when button is pushed */}
      {/* Display books that match user input query */}
      {/* Allow user to add books to log and display in UI when one is added */}

      <h2>Search Books</h2>
      {/* Search query input */}
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} />

      {/* Display at most 10 books that match the query */}
      {queriedBooks ? (
        <ul>
          {queriedBooks.map(book => (
            <li key={book.id}>
              {book.volumeInfo.title}
              {book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail && (
                <img src={book.volumeInfo.imageLinks.smallThumbnail} alt={`${book.volumeInfo.title} Cover`} />
              )}
              {!book.volumeInfo.imageLinks && <span>No image available</span>}

              {/* Button to log a book */}
              <button onClick={() => handleLogBook(user, book)}>Add to Read</button>
            </li>
          ))}
        </ul>
      ) : (
        'No results'
      )}
    </div>
  )
}
