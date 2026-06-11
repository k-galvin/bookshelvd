import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import Book from './Book'
import LoginPage from './LoginPage'

export default function DiscoverBooksPage({
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
  const [didionBooks, setDidionBooks] = useState([])
  const [pattiBooks, setPattiBooks] = useState([])
  const [levyBooks, setLevyBooks] = useState([])
  const [cuskBooks, setCuskBooks] = useState([])
  const [trendingBooks, setTrendingBooks] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDiscoverData() {
      try {
        setLoading(true)
        setError('')
        
        const [
          didion,
          patti,
          levy,
          cusk,
          trending
        ] = await Promise.all([
          searchBooks('inauthor:"Joan Didion"'),
          searchBooks('inauthor:"Patti Smith"'),
          searchBooks('inauthor:"Deborah Levy"'),
          searchBooks('inauthor:"Rachel Cusk"'),
          searchBooks('subject:fiction')
        ])

        setDidionBooks(didion.slice(0, 10))
        setPattiBooks(patti.slice(0, 10))
        setLevyBooks(levy.slice(0, 10))
        setCuskBooks(cusk.slice(0, 10))
        setTrendingBooks(trending.slice(0, 10))
      } catch (err) {
        console.error('Error loading discover books:', err)
        setError('Failed to load recommendations. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDiscoverData()
    }
  }, [user])

  if (!user) return <LoginPage />

  const ensureHttps = (url) => {
    if (!url) return null
    return url.replace('http://', 'https://')
  }

  const renderBookRow = (books, title) => {
    if (books.length === 0) return null

    return (
      <div className="discover-section">
        <h3 className="discover-section-title">{title}</h3>
        <div className="discover-row-container">
          <div className="discover-row-scroll">
            {books.map(book => {
              const info = book.volumeInfo
              const cover = ensureHttps(info?.imageLinks?.thumbnail || info?.imageLinks?.smallThumbnail)
              
              return (
                <div key={book.id} className="discover-book-card-wrapper">
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
                    title={info?.title}
                    authors={info?.authors}
                    size="large"
                    lists={lists}
                    onAssignToList={onAssignToList}
                    onMarkAsRead={onMarkAsRead}
                    onUpdateBookRating={onUpdateBookRating}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="discover-page-container">
      <div className="book-log-header">
        <h2 className="book-log-title">DISCOVER BOOKS</h2>
        <span className="diary-total-count">Curated recommendations & trending works</span>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="search-results-error">{error}</div>
      ) : (
        <div className="discover-sections-stack">
          {renderBookRow(trendingBooks, 'TRENDING FICTION')}
          {renderBookRow(didionBooks, 'BOOKS BY JOAN DIDION')}
          {renderBookRow(pattiBooks, 'BOOKS BY PATTI SMITH')}
          {renderBookRow(levyBooks, 'BOOKS BY DEBORAH LEVY')}
          {renderBookRow(cuskBooks, 'BOOKS BY RACHEL CUSK')}
        </div>
      )}
    </div>
  )
}
