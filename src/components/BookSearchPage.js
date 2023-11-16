import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'

export default function BookSearchPage({ user, addBook }) {
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

    handleSearch()
  }, [query])

  return (
    <div>
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
              <button onClick={() => addBook(user, book)}>Add to Read</button>
            </li>
          ))}
        </ul>
      ) : (
        'No results'
      )}
    </div>
  )
}
