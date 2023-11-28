import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function BookSearchPage({ user, addBook, deleteBook, loggedBooks }) {
  const [query, setQuery] = useState('')
  const [queriedBooks, setQueriedBooks] = useState([])

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim() !== '') {
        const response = await searchBooks(query)
        setQueriedBooks(response)
      } else {
        // If the query is empty, set the queried books to an empty array
        setQueriedBooks([])
      }
    }

    handleSearch()
  }, [query])

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="search-page">
      <h2>Search Books</h2>
      {/* Search query input */}
      <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for books..." />

      {/* Display at most 10 books that match the query */}
      {queriedBooks ? (
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
      ) : (
        'No results'
      )}
    </div>
  )
}
