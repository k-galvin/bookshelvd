import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const navigate = useNavigate()

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

  return (
    <header>
      <div className="header-left">
        {/* Logo that links to homepage */}
        <Link to="/" className="header-link logo">
          <img src="/logo-with-text.png" alt="bookshelved logo" className="logo-image" />
        </Link>
      </div>

      <div className="header-right">
        {user && (
          <>
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
            {/* Link to logged books page */}
            <Link to="/book-log" className="header-link">
              BOOKS
            </Link>
            {/* Link to tbr page */}
            <Link to="/tbr" className="header-link">
              TBR
            </Link>
          </>
        )}
        {/* Login/Logout button */}
        <div className="header-auth">
          {!user ? <SignIn /> : <SignOut />}
        </div>
      </div>
    </header>
  )
}
