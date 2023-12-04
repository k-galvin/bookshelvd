import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function BookSearchPage({ user, addBook, deleteBook, loggedBooks }) {
  const [query, setQuery] = useState('')
  const [queriedBooks, setQueriedBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get ten books based on the user's query, with results every 300ms
  useEffect(() => {
    let timeoutId

    const handleSearch = async () => {
      try {
        setError('')
        const response = await searchBooks(query)
        setQueriedBooks(response)
      } catch (error) {
        setError(error)
        setQueriedBooks([])
      } finally {
        setLoading(false)
      }
    }

    // Delay the execution of handleSearch
    timeoutId = setTimeout(() => {
      handleSearch()
    }, 300)

    // Clear the timeout
    return () => {
      clearTimeout(timeoutId)
    }
  }, [query])

  // If not logged in, display login page
  if (!user) {
    return <LoginPage />
  }

  // Handle query input change
  const handleInputChange = e => {
    setQuery(e.target.value)
    setLoading(true)
  }

  return (
    <div className="search-page">
      <h2>Search Books</h2>
      {/* Search query input */}
      <input
        className="search-bar"
        id="search-bar"
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for books..."
      />

      {/* Display loading spinner while fetching books based on query */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {/* Display error message if books can't be fetched */}
      {error ? (
        <div className="books-grid-container search error">Error: {error.message}</div>
      ) : (
        // Display at most 10 books that match the query
        <div className="books-grid-container search">
          {queriedBooks.length !== 0 ? (
            <div className="books-container">
              {queriedBooks.map(book => (
                <div key={book.id} className="small-book-container">
                  <Book
                    book={book}
                    cover={
                      book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.smallThumbnail
                        ? book.volumeInfo.imageLinks.smallThumbnail
                        : null
                    }
                    loggedBooks={loggedBooks}
                    addBook={addBook}
                    deleteBook={deleteBook}
                    user={user}
                    title={book.volumeInfo.title}
                    authors={book.volumeInfo.authors}
                    description={book.volumeInfo.description}
                    averageRating={book.volumeInfo.averageRating}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
