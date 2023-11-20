import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import Book from './Book'

export default function BookSearchPage({ user, addBook, deleteBook, loggedBooks }) {
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
              />
            </li>
          ))}
        </ul>
      ) : (
        'No results'
      )}
    </div>
  )
}
