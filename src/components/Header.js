import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import { searchBooks } from '../services/apiService'
import LogModal from './LogModal'

export default function Header({ user, addBook }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  
  // User dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef(null)

  // LOG split button dropdown state
  const [isLogDropdownOpen, setIsLogDropdownOpen] = useState(false)
  const logDropdownRef = useRef(null)

  // LOG search overlay modal states
  const [isLogSearchOpen, setIsLogSearchOpen] = useState(false)
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [logSearchResults, setLogSearchResults] = useState([])
  const [logSearchLoading, setLogSearchLoading] = useState(false)
  const [selectedLogBook, setSelectedLogBook] = useState(null)
  
  // Mobile responsiveness states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
      if (logDropdownRef.current && !logDropdownRef.current.contains(event.target)) {
        setIsLogDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Google Books search for logging
  useEffect(() => {
    if (!logSearchQuery.trim()) {
      setLogSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLogSearchLoading(true)
      try {
        const results = await searchBooks(logSearchQuery)
        setLogSearchResults(results)
      } catch (error) {
        console.error('Error searching books for logging:', error)
      } finally {
        setLogSearchLoading(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(delayDebounceFn)
  }, [logSearchQuery])

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/book-search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchExpanded(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }

  const handleSignOut = () => {
    signOut(auth)
    setIsUserDropdownOpen(false)
    navigate('/')
  }

  const handleSaveLog = async (logDetails) => {
    if (user && selectedLogBook) {
      await addBook(user, selectedLogBook, logDetails)
      setSelectedLogBook(null)
      setIsLogSearchOpen(false)
      setLogSearchQuery('')
      setLogSearchResults([])
    }
  }

  // Helper to get initials for profile avatar fallback
  const getUserInitials = () => {
    if (!user) return ''
    if (user.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
    return user.email ? user.email.slice(0, 2).toUpperCase() : 'U'
  }

  return (
    <header>
      <div className="header-inner">
        <div className="header-left">
          {/* Logo that links to homepage */}
          <Link to="/" className="header-link logo">
            <img src="/logo-with-text.png" alt="bookshelved logo" className="logo-image" />
          </Link>
        </div>

        <div className="header-right desktop-nav">
          {user ? (
            <>
              {/* 1) Profile avatar + username dropdown */}
              <div className="header-user-menu" ref={userDropdownRef}>
                <div 
                  className="user-profile-trigger" 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="header-avatar" />
                  ) : (
                    <div className="header-avatar fallback-avatar">
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="username">{user.displayName || user.email}</span>
                  <span className="material-symbols-outlined expand-chevron">expand_more</span>
                </div>

                {isUserDropdownOpen && (
                  <div className="header-dropdown-menu">
                    <Link to="/profile" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>Profile</Link>
                    <Link to="/book-log" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>Books</Link>
                    <Link to="/diary" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>Diary</Link>
                    <Link to="/tbr" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>TBR</Link>
                    <Link to="/my-lists" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>Lists</Link>
                    <Link to="/liked" className="dropdown-menu-item" onClick={() => setIsUserDropdownOpen(false)}>Likes</Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-menu-item signout-btn" onClick={handleSignOut}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* 2) BOOKS */}
              <Link to="/books" className="header-link">
                BOOKS
              </Link>

              {/* 3) LISTS */}
              <Link to="/lists" className="header-link">
                LISTS
              </Link>

              {/* 4) SEARCH */}
              <div className={`header-search-wrapper ${isSearchExpanded ? 'expanded' : ''}`}>
                {!isSearchExpanded ? (
                  <span 
                    className="material-symbols-outlined search-trigger"
                    onClick={() => setIsSearchExpanded(true)}
                  >
                    search
                  </span>
                ) : (
                  <div className="header-search-container-expanded">
                    <input 
                      autoFocus
                      type="text" 
                      className="header-search-input-expanded" 
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                    />
                    <span 
                      className="material-symbols-outlined search-submit-icon"
                      onClick={handleSearchSubmit}
                    >
                      search
                    </span>
                  </div>
                )}
              </div>

              {/* 5) LOG split button */}
              <div className="log-split-button-container" ref={logDropdownRef}>
                <button 
                  className="log-btn-main" 
                  onClick={() => setIsLogSearchOpen(true)}
                >
                  + LOG
                </button>
                <button 
                  className="log-btn-chevron"
                  onClick={() => setIsLogDropdownOpen(!isLogDropdownOpen)}
                >
                  <span className="material-symbols-outlined">expand_more</span>
                </button>

                {isLogDropdownOpen && (
                  <div className="log-dropdown-menu">
                    <Link 
                      to="/lists/new" 
                      className="log-dropdown-item"
                      onClick={() => setIsLogDropdownOpen(false)}
                    >
                      Create a list...
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header-auth">
              <button 
                className="user-button" 
                onClick={() => {
                  const provider = new (window.require ? window.require('firebase/auth').GoogleAuthProvider : require('firebase/auth').GoogleAuthProvider)();
                  const signInWithPopup = window.require ? window.require('firebase/auth').signInWithPopup : require('firebase/auth').signInWithPopup;
                  signInWithPopup(auth, provider);
                }}
              >
                SIGN IN
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="mobile-nav-controls">
          <button 
            type="button" 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer/Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-dropdown">
          {user ? (
            <div className="mobile-dropdown-content">
              {/* User info row */}
              <div className="mobile-user-profile-header">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="header-avatar" />
                ) : (
                  <div className="header-avatar fallback-avatar">
                    {getUserInitials()}
                  </div>
                )}
                <span className="username">{user.displayName || user.email}</span>
              </div>

              {/* Mobile Search input */}
              <div className="mobile-search-bar">
                <input 
                  type="text" 
                  className="mobile-search-input" 
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                      setIsMobileMenuOpen(false);
                    }
                  }}
                />
                <span className="material-symbols-outlined mobile-search-btn" onClick={() => { handleSearchSubmit(); setIsMobileMenuOpen(false); }}>search</span>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="mobile-links-list">
                <Link to="/profile" className="mobile-link-item">Profile</Link>
                <Link to="/books" className="mobile-link-item">Discover Books</Link>
                <Link to="/lists" className="mobile-link-item">All Lists</Link>
                <Link to="/book-log" className="mobile-link-item">Books Read</Link>
                <Link to="/diary" className="mobile-link-item">Diary</Link>
                <Link to="/tbr" className="mobile-link-item">TBR</Link>
                <Link to="/my-lists" className="mobile-link-item">My Lists</Link>
                <Link to="/liked" className="mobile-link-item">Likes</Link>
              </nav>

              <button 
                type="button" 
                className="mobile-log-btn" 
                onClick={() => { setIsLogSearchOpen(true); setIsMobileMenuOpen(false); }}
              >
                + LOG A BOOK
              </button>

              <button type="button" className="mobile-signout-btn" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mobile-dropdown-content unauthorized">
              <button 
                className="user-button mobile-signin-btn" 
                onClick={() => {
                  const provider = new (window.require ? window.require('firebase/auth').GoogleAuthProvider : require('firebase/auth').GoogleAuthProvider)();
                  const signInWithPopup = window.require ? window.require('firebase/auth').signInWithPopup : require('firebase/auth').signInWithPopup;
                  signInWithPopup(auth, provider);
                  setIsMobileMenuOpen(false);
                }}
              >
                SIGN IN
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Search Overlay for Logging */}
      {isLogSearchOpen && (
        <div className="log-search-overlay" onClick={() => setIsLogSearchOpen(false)}>
          <div className="log-search-content" onClick={(e) => e.stopPropagation()}>
            <div className="log-search-header">
              <h2>ADD TO DIARY</h2>
              <span 
                className="material-symbols-outlined close-overlay-btn"
                onClick={() => setIsLogSearchOpen(false)}
              >
                close
              </span>
            </div>
            
            <div className="log-search-input-wrapper">
              <span className="material-symbols-outlined search-icon">search</span>
              <input 
                autoFocus
                type="text" 
                className="log-search-input" 
                placeholder="Search for a book to log..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
              />
            </div>

            <div className="log-search-results">
              {logSearchLoading && (
                <div className="overlay-spinner">
                  <div className="spinner"></div>
                </div>
              )}

              {!logSearchLoading && logSearchQuery && logSearchResults.length === 0 && (
                <p className="no-results-text">No books found for "{logSearchQuery}"</p>
              )}

              {!logSearchLoading && logSearchResults.map((book) => {
                const info = book.volumeInfo;
                const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
                const year = info.publishedDate ? info.publishedDate.split('-')[0] : '';
                
                return (
                  <div 
                    key={book.id} 
                    className="log-search-row"
                    onClick={() => setSelectedLogBook(book)}
                  >
                    {cover ? (
                      <img src={cover.replace('http://', 'https://')} alt={info.title} className="log-search-cover" />
                    ) : (
                      <div className="log-search-cover-fallback">No Cover</div>
                    )}
                    <div className="log-search-details">
                      <span className="log-search-title">{info.title}</span>
                      <span className="log-search-meta">
                        {info.authors?.join(', ')} {year && `(${year})`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* LogModal render when selectedLogBook is set */}
      {selectedLogBook && (
        <LogModal 
          book={selectedLogBook} 
          onSave={handleSaveLog} 
          onCancel={() => setSelectedLogBook(null)}
        />
      )}
    </header>
  )
}
