import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { searchBooks, fetchOriginalPublicationYear } from '../services/apiService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function BookSearchPage({ user, loggedBooks, tbr, addBook, deleteBook, updateBook, addToTBR }) {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const navigate = useNavigate()
  
  const [queriedBooks, setQueriedBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!urlQuery) {
      setQueriedBooks([])
      return
    }

    const handleSearch = async () => {
      try {
        setError('')
        setLoading(true)
        const response = await searchBooks(urlQuery)
        setQueriedBooks(response)

        // Fetch original years in parallel for all results
        const booksWithOriginalYear = await Promise.all(
          response.map(async (book) => {
            const originalYear = await fetchOriginalPublicationYear(
              book.volumeInfo.title,
              book.volumeInfo.authors?.[0]
            )
            return { ...book, originalYear }
          })
        )
        setQueriedBooks(booksWithOriginalYear)
      } catch (error) {
        setError(error)
        setQueriedBooks([])
      } finally {
        setLoading(false)
      }
    }

    handleSearch()
  }, [urlQuery])

  if (!user) return <LoginPage />

  // Helper to ensure image URLs are HTTPS
  const ensureHttps = (url) => {
    if (!url) return null;
    return url.replace('http://', 'https://');
  };

  return (
    <div className="search-page-new">
      <div className="search-header">
        <h2>SEARCH RESULTS FOR "{urlQuery.toUpperCase()}"</h2>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {error ? (
        <div className="search-results-error">Error: {error.message}</div>
      ) : (
        <div className="search-results-list">
          {queriedBooks.length !== 0 ? (
            queriedBooks.map(book => {
              const info = book.volumeInfo;
              const cover = ensureHttps(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail);
              const volumeYear = info.publishedDate?.split('-')[0];
              const displayYear = book.originalYear || volumeYear;
              
              return (
                <div 
                  key={book.id} 
                  className="search-result-row"
                >
                  <div className="result-cover-interactive">
                    <Book
                      book={book}
                      cover={cover}
                      loggedBooks={loggedBooks}
                      tbr={tbr}
                      addBook={addBook}
                      deleteBook={deleteBook}
                      updateBook={updateBook}
                      user={user}
                      addToTBR={addToTBR}
                      title={info.title}
                      authors={info.authors}
                      size="small"
                    />
                  </div>
                  <div className="result-details-clickable" onClick={() => navigate(`/book/${book.id}`)}>
                    <div className="result-title-row">
                      <span className="result-title">{info.title}</span>
                      <span className="result-year">{displayYear}</span>
                    </div>
                    <div className="result-author">
                      By {info.authors?.join(', ')}
                    </div>
                  </div>
                </div>
              )
            })
          ) : urlQuery && !loading ? (
             <div className="no-results">No books found for "{urlQuery}"</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
