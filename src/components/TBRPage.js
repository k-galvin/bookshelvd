import { useState, useEffect } from 'react'
import Book from './Book'
import LoginPage from './LoginPage'
import { fetchOriginalPublicationYear } from '../services/apiService'
import ProfileHeader from './ProfileHeader'

export default function TBRPage({ user, loggedBooks, tbr = [], addBook, deleteBook, updateBook, handleAddToTBR }) {
  const [selectedCentury, setSelectedCentury] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortOption, setSortOption] = useState('newestAdded')
  const [activeDropdown, setActiveDropdown] = useState(null) // 'century' | 'genre' | 'sort' | null
  const [enrichedTBR, setEnrichedTBR] = useState([])

  // Enrich tbr with original years if they are missing
  useEffect(() => {
    if (!tbr) return;

    const enrichTBR = async () => {
      const enriched = await Promise.all(
        tbr.map(async (book) => {
          if (book.originalYear) return book;
          
          const originalYear = await fetchOriginalPublicationYear(book.title, book.authors?.[0]);
          return { ...book, originalYear };
        })
      );
      setEnrichedTBR(enriched);
    };

    enrichTBR();
  }, [tbr]);

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

  if (!user) return <LoginPage />

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

  // Compile unique centuries and genres dynamically from TBR
  const centuriesList = Array.from(
    new Set(
      tbr
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
    new Set(tbr.flatMap(book => book.categories || []))
  ).sort()

  // Apply filtering
  const tbrToDisplay = enrichedTBR.length > 0 ? enrichedTBR : tbr
  const filteredTBR = tbrToDisplay.filter(book => {
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

    return true
  })

  // Helper to get raw numeric/time value for comparison
  const getVal = (obj, field) => {
    if (field === 'releaseYear') {
      const yearValue = obj.originalYear || obj.publishedDate;
      if (!yearValue) return 0;
      const year = yearValue.toString().split('-')[0];
      return parseInt(year, 10) || 0;
    }

    const val = obj[field];
    if (val === undefined || val === null || val === '') return 0;
    
    if (field === 'createdAt') {
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (val.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
      return new Date(val).getTime();
    }
    
    if (field === 'pageCount') return val || 0;
    return val;
  };

  // Sort
  const sortedTBR = [...filteredTBR].sort((a, b) => {
    switch (sortOption) {
      case 'newestAdded':
        return getVal(b, 'createdAt') - getVal(a, 'createdAt')
      case 'oldestAdded':
        return getVal(a, 'createdAt') - getVal(b, 'createdAt')
      case 'newestRelease':
        return getVal(b, 'releaseYear') - getVal(a, 'releaseYear')
      case 'oldestRelease':
        return getVal(a, 'releaseYear') - getVal(b, 'releaseYear')
      case 'shortestLength':
        return getVal(a, 'pageCount') - getVal(b, 'pageCount')
      case 'longestLength':
        return getVal(b, 'pageCount') - getVal(a, 'pageCount')
      default:
        return 0
    }
  })

  const getSortOptionLabel = (option) => {
    switch (option) {
      case 'newestAdded':
      case 'oldestAdded': return 'DATE ADDED'
      case 'newestRelease':
      case 'oldestRelease': return 'RELEASE DATE'
      case 'shortestLength':
      case 'longestLength': return 'LENGTH'
      default: return 'DATE ADDED'
    }
  }

  return (
    <div className="book-log-page">
      <ProfileHeader user={user} />
      <div className="book-log-header flex-column-tablet">
        <h2 className="book-log-title">YOU WANT TO READ {tbr.length} {tbr.length === 1 ? 'BOOK' : 'BOOKS'}</h2>

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

          {/* Sort Dropdown */}
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
                <div className="dropdown-menu-header">DATE ADDED</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'newestAdded' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('newestAdded'); setActiveDropdown(null); }}
                >
                  Newest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'oldestAdded' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('oldestAdded'); setActiveDropdown(null); }}
                >
                  Earliest First
                </div>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-menu-header">RELEASE DATE</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'newestRelease' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('newestRelease'); setActiveDropdown(null); }}
                >
                  Newest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'oldestRelease' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('oldestRelease'); setActiveDropdown(null); }}
                >
                  Earliest First
                </div>
                
                <div className="dropdown-menu-divider" />
                <div className="dropdown-menu-header">BOOK LENGTH</div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'shortestLength' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('shortestLength'); setActiveDropdown(null); }}
                >
                  Shortest First
                </div>
                <div 
                  className={`custom-dropdown-item ${sortOption === 'longestLength' ? 'selected' : ''}`}
                  onClick={() => { setSortOption('longestLength'); setActiveDropdown(null); }}
                >
                  Longest First
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {sortedTBR && sortedTBR.length > 0 ? (
        <div className="books-container">
          {sortedTBR.map(book => (
            <div key={book.volumeId}>
              <Book
                book={{...book, id: book.volumeId}}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                tbr={tbr}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                addToTBR={handleAddToTBR}
                title={book.title}
                authors={book.authors}
                size="small"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card" style={{ padding: '3em' }}>
          <p>No books match your TBR filters.</p>
          <button 
            className="dashboard-link-btn" 
            onClick={() => { setSelectedCentury('all'); setSelectedGenre('all'); setSortOption('newestAdded'); }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
