import { useState, useEffect } from 'react'
import { getSortedBooks } from '../services/bookService'
import { fetchOriginalPublicationYear } from '../services/apiService'
import LoggedBookGrid from './LoggedBookGrid'
import LoginPage from './LoginPage'
import StarRating from './StarRating'
import ProfileHeader from './ProfileHeader'

export default function BookLogPage({ user, deleteBook, addBook, updateBook, loggedBooks = [], tbr, loading, addToTBR }) {
  // Initialize sorting and filter states
  const [sortOption, setSortOption] = useState('newestToOldestLogged')
  const [selectedCentury, setSelectedCentury] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [maxRating, setMaxRating] = useState(5)
  const [filterUnrated, setFilterUnrated] = useState(false)
  const [booksWithOriginalYears, setBooksWithOriginalYears] = useState([])
  const [activeDropdown, setActiveDropdown] = useState(null) // 'century' | 'genre' | 'rating' | 'sort' | null

  // Outside click listener for custom filter dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-filter-dropdown')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Enrich books with original years if they are missing
  useEffect(() => {
    if (!loggedBooks) return;

    const enrichBooks = async () => {
      const enriched = await Promise.all(
        loggedBooks.map(async (book) => {
          if (book.originalYear) return book;
          
          const originalYear = await fetchOriginalPublicationYear(book.title, book.authors?.[0]);
          return { ...book, originalYear };
        })
      );
      setBooksWithOriginalYears(enriched);
    };

    enrichBooks();
  }, [loggedBooks]);

  // Helper for computing century names
  const getCenturyName = (book) => {
    const yearVal = book.originalYear || book.publishedDate
    if (!yearVal) return null
    const year = parseInt(yearVal.toString().split('-')[0], 10)
    if (!year) return null
    if (year >= 2000) return '21st Century'
    if (year >= 1900) return '20th Century'
    if (year >= 1800) return '19th Century'
    return 'Earlier'
  }

  // If not logged in, display login page
  if (!user) {
    return <LoginPage />
  }

  // Compile unique centuries and genres dynamically
  const centuriesList = Array.from(
    new Set(
      loggedBooks
        .map(book => getCenturyName(book))
        .filter(Boolean)
    )
  )
  const centuryOrder = {
    '21st Century': 4,
    '20th Century': 3,
    '19th Century': 2,
    'Earlier': 1
  }
  const sortedCenturies = centuriesList.sort((a, b) => centuryOrder[b] - centuryOrder[a])

  const genres = Array.from(
    new Set(loggedBooks.flatMap(book => book.categories || []))
  ).sort()

  // Apply filtering
  const booksToDisplay = booksWithOriginalYears.length > 0 ? booksWithOriginalYears : loggedBooks
  const filteredBooks = booksToDisplay.filter(book => {
    // 1. Century filter
    if (selectedCentury !== 'all') {
      const cent = getCenturyName(book)
      if (cent !== selectedCentury) return false
    }

    // 2. Genre filter
    if (selectedGenre !== 'all') {
      const cats = book.categories || []
      const hasGenre = cats.some(c => c.toLowerCase() === selectedGenre.toLowerCase())
      if (!hasGenre) return false
    }

    // 3. Rating filter
    if (filterUnrated) {
      if (book.userRating && book.userRating > 0) return false
    } else {
      if (minRating > 0 || maxRating < 5) {
        const rating = book.userRating || 0
        if (rating < minRating || rating > maxRating) return false
      }
    }

    return true
  })

  // Helper to deduplicate books by volumeId
  const deduplicateBooks = (booksList) => {
    const seen = new Set()
    return booksList.filter(book => {
      const volId = book.volumeId || book.id
      if (seen.has(volId)) return false
      seen.add(volId)
      return true
    })
  }

  // Sort the filtered books array based on the selected sorting option, then deduplicate
  const sortedBooks = deduplicateBooks(getSortedBooks(filteredBooks, sortOption))
  
  // Separation logic based on User Rating when sorting by rating
  const unratedBooks = sortedBooks.filter(book => !book.userRating || book.userRating === 0)
  const ratedBooks = sortedBooks.filter(book => book.userRating && book.userRating > 0)
  
  // Separation logic based on page counts when sorting by length
  const noPageCountBooks = sortedBooks.filter(book => !book.pageCount)
  const pageCountBooks = sortedBooks.filter(book => book.pageCount)

  const getSortOptionLabel = (option) => {
    switch (option) {
      case 'newestToOldestLogged':
      case 'oldestToNewestLogged': return 'DATE LOGGED'
      case 'newestToOldestRelease':
      case 'oldestToNewestRelease': return 'RELEASE DATE'
      case 'highestToLowestRating':
      case 'lowestToHighestRating': return 'RATING'
      case 'shortestToLongestLength':
      case 'longestToShortestLength': return 'LENGTH'
      default: return 'DATE LOGGED'
    }
  }

  return (
    <div className="book-log-page">
      <ProfileHeader user={user} />
      {/* Header containing page title and filter toolbar */}
      <div className="book-log-header flex-column-tablet">
        <h2 className="book-log-title">READ</h2>

        {/* Filter / Sort Toolbar */}
        <div className="filter-toolbar">
          {/* Century Filter */}
          <div className="custom-filter-dropdown">
            <button 
              type="button"
              className={`custom-dropdown-btn ${selectedCentury !== 'all' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'century' ? null : 'century')}
            >
              <span>{selectedCentury === 'all' ? 'CENTURY' : selectedCentury.toUpperCase()}</span>
              <span className="material-symbols-outlined dropdown-chevron">expand_more</span>
            </button>
            {activeDropdown === 'century' && (
              <div className="custom-dropdown-menu">
                <div 
                  className={`custom-dropdown-item ${selectedCentury === 'all' ? 'selected' : ''}`}
                  onClick={() => { setSelectedCentury('all'); setActiveDropdown(null); }}
                >
                  All Centuries
                </div>
                {sortedCenturies.map(cent => (
                  <div 
                    key={cent}
                    className={`custom-dropdown-item ${selectedCentury === cent ? 'selected' : ''}`}
                    onClick={() => { setSelectedCentury(cent); setActiveDropdown(null); }}
                  >
                    {cent}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genre Filter */}
          <div className="custom-filter-dropdown">
            <button 
              type="button"
              className={`custom-dropdown-btn ${selectedGenre !== 'all' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'genre' ? null : 'genre')}
            >
              <span>{selectedGenre === 'all' ? 'GENRE' : selectedGenre.toUpperCase()}</span>
              <span className="material-symbols-outlined dropdown-chevron">expand_more</span>
            </button>
            {activeDropdown === 'genre' && (
              <div className="custom-dropdown-menu">
                <div 
                  className={`custom-dropdown-item ${selectedGenre === 'all' ? 'selected' : ''}`}
                  onClick={() => { setSelectedGenre('all'); setActiveDropdown(null); }}
                >
                  All Genres
                </div>
                {genres.map(g => (
                  <div 
                    key={g}
                    className={`custom-dropdown-item ${selectedGenre === g ? 'selected' : ''}`}
                    onClick={() => { setSelectedGenre(g); setActiveDropdown(null); }}
                  >
                    {g}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rating Range Filter */}
          <div className="custom-filter-dropdown">
            <button 
              type="button"
              className={`custom-dropdown-btn ${filterUnrated || minRating > 0 || maxRating < 5 ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')}
            >
              <span>
                {filterUnrated 
                  ? 'UNRATED' 
                  : (minRating > 0 || maxRating < 5) 
                    ? (minRating === maxRating ? `RATING: ${minRating}★` : `RATING: ${minRating}★-${maxRating}★`)
                    : 'RATING'}
              </span>
              <span className="material-symbols-outlined dropdown-chevron">expand_more</span>
            </button>
            {activeDropdown === 'rating' && (
              <div className="custom-dropdown-menu rating-range-dropdown">
                <div className="dropdown-menu-header">RATING RANGE</div>
                <div className="rating-range-selector">
                  <div className="range-row">
                    <span>Min:</span>
                    <StarRating 
                      rating={minRating} 
                      interactive={true} 
                      onChange={(val) => { setMinRating(val); setFilterUnrated(false); }} 
                      size="small"
                    />
                    <span className="range-val">{minRating > 0 ? `${minRating}★` : 'Any'}</span>
                  </div>
                  <div className="range-row">
                    <span>Max:</span>
                    <StarRating 
                      rating={maxRating} 
                      interactive={true} 
                      onChange={(val) => { setMaxRating(val); setFilterUnrated(false); }} 
                      size="small"
                    />
                    <span className="range-val">{maxRating > 0 ? `${maxRating}★` : 'Any'}</span>
                  </div>
                </div>
                
                <div className="dropdown-menu-divider" />
                <label className="dropdown-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={filterUnrated}
                    onChange={(e) => setFilterUnrated(e.target.checked)}
                  />
                  <span>Show Unrated Only</span>
                </label>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-actions">
                  <button 
                    type="button" 
                    className="dropdown-reset-btn"
                    onClick={() => {
                      setMinRating(0);
                      setMaxRating(5);
                      setFilterUnrated(false);
                      setActiveDropdown(null);
                    }}
                  >
                    RESET FILTER
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Custom Sort Dropdown */}
          <div className="custom-filter-dropdown">
            <span className="sort-label-inline">SORT BY</span>
            <button 
              type="button"
              className="custom-dropdown-btn sort-dropdown-btn"
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
            >
              <span>{getSortOptionLabel(sortOption)}</span>
              <span className="material-symbols-outlined dropdown-chevron">expand_more</span>
            </button>
            {activeDropdown === 'sort' && (
              <div className="custom-dropdown-menu sort-dropdown-menu">
                <div className="dropdown-menu-header">DATE LOGGED</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'newestToOldestLogged' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('newestToOldestLogged'); setActiveDropdown(null); }}
                >
                  Newest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'oldestToNewestLogged' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('oldestToNewestLogged'); setActiveDropdown(null); }}
                >
                  Earliest First
                </div>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-menu-header">RELEASE DATE</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'newestToOldestRelease' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('newestToOldestRelease'); setActiveDropdown(null); }}
                >
                  Newest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'oldestToNewestRelease' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('oldestToNewestRelease'); setActiveDropdown(null); }}
                >
                  Earliest First
                </div>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-menu-header">YOUR RATING</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'highestToLowestRating' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('highestToLowestRating'); setActiveDropdown(null); }}
                >
                  Highest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'lowestToHighestRating' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('lowestToHighestRating'); setActiveDropdown(null); }}
                >
                  Lowest First
                </div>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-menu-header">BOOK LENGTH</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'shortestToLongestLength' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('shortestToLongestLength'); setActiveDropdown(null); }}
                >
                  Shortest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'longestToShortestLength' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('longestToShortestLength'); setActiveDropdown(null); }}
                >
                  Longest First
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Display sorted & filtered logged books */}
      <div>
        {/* Display loading spinner while books are rendering */}
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}

        {sortedBooks && sortedBooks.length !== 0 ? (
          <div className="books-grid-container">
            {sortOption.includes('Rating') && (
              <LoggedBookGrid
                books={ratedBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}

            {sortOption.includes('Length') && (
              <LoggedBookGrid
                books={pageCountBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}

            {!sortOption.includes('Rating') && !sortOption.includes('Length') && (
              <LoggedBookGrid
                books={sortedBooks}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                loggedBooks={loggedBooks}
                tbr={tbr}
                loading={loading}
                addToTBR={addToTBR}
              />
            )}
          </div>
        ) : (
          <div className="empty-state-card" style={{ padding: '3em' }}>
            <p>No books match your selected filters.</p>
            <button 
              className="dashboard-link-btn" 
              onClick={() => { setSelectedCentury('all'); setSelectedGenre('all'); setMinRating(0); setMaxRating(5); setFilterUnrated(false); }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Books you haven't rated displayed here if sorting by rating */}
        {unratedBooks.length > 0 && sortOption.includes('Rating') && (
          <div className="missing-info-books-grid-container">
            <h2>Unrated by You</h2>
            <LoggedBookGrid
              books={unratedBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              updateBook={updateBook}
              user={user}
              loggedBooks={loggedBooks}
              tbr={tbr}
              loading={loading}
              addToTBR={addToTBR}
            />
          </div>
        )}

        {/* No page count books displayed here if sorting by length */}
        {noPageCountBooks.length > 0 && sortOption.includes('Length') && (
          <div className="missing-info-books-grid-container">
            <h2>No Page Count Available</h2>
            <LoggedBookGrid
              books={noPageCountBooks}
              addBook={addBook}
              deleteBook={deleteBook}
              updateBook={updateBook}
              user={user}
              loggedBooks={loggedBooks}
              tbr={tbr}
              loading={loading}
              addToTBR={addToTBR}
            />
          </div>
        )}
      </div>
    </div>
  )
}

