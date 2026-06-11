import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { searchBooks } from '../services/apiService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function AuthorPage({
  user,
  loggedBooks,
  tbr,
  addBook,
  deleteBook,
  updateBook,
  handleAddToTBR,
  lists,
  onAssignToList,
  onMarkAsRead,
  onUpdateBookRating
}) {
  const { authorName } = useParams()
  const decodedAuthorName = decodeURIComponent(authorName)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAuthorBooks() {
      try {
        setLoading(true)
        setError('')
        // Query Google Books API with inauthor filter, requesting 40 results
        const results = await searchBooks(`inauthor:"${decodedAuthorName}"`, 40)
        
        // Deduplicate the results by book title in memory (case, punctuation, and subtitle-insensitive)
        const seenTitles = new Set()
        const deduplicated = results.filter(book => {
          const title = book.volumeInfo?.title || book.title || ''
          const normalized = title
            .toLowerCase()
            .split(':')[0]
            .split('(')[0]
            .trim()
            .replace(/[^a-z0-9]/g, '')
          
          if (!normalized) return false
          if (seenTitles.has(normalized)) return false
          seenTitles.add(normalized)
          return true
        })

        // Limit to top 30 books
        setBooks(deduplicated.slice(0, 30))
      } catch (err) {
        console.error('Error fetching author books:', err)
        setError('Failed to load books for this author.')
      } finally {
        setLoading(false)
      }
    }

    if (decodedAuthorName) {
      fetchAuthorBooks()
    }
  }, [decodedAuthorName])

  if (!user) return <LoginPage />

  const ensureHttps = (url) => {
    if (!url) return null
    return url.replace('http://', 'https://')
  }

  return (
    <div className="author-page-container">
      <div className="book-log-header">
        <h2 className="book-log-title">BOOKS BY {decodedAuthorName.toUpperCase()}</h2>
        {!loading && <span className="diary-total-count">{books.length} book(s)</span>}
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="search-results-error">{error}</div>
      ) : books.length > 0 ? (
        <div className="books-container">
          {books.map(book => {
            const info = book.volumeInfo || book
            const cover = ensureHttps(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || book.thumbnail)
            
            return (
              <div key={book.id}>
                <Book
                  book={book}
                  cover={cover}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                  user={user}
                  addToTBR={handleAddToTBR}
                  title={info.title}
                  authors={info.authors}
                  size="small"
                  lists={lists}
                  onAssignToList={onAssignToList}
                  onMarkAsRead={onMarkAsRead}
                  onUpdateBookRating={onUpdateBookRating}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state-card" style={{ padding: '3em' }}>
          <p>No books found for this author.</p>
        </div>
      )}
    </div>
  )
}
