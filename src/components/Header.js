import { Link } from 'react-router-dom'
import { useState } from 'react'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  const [logoLoaded, setLogoLoaded] = useState(false)

  // Handles logo image loading status
  const handleLogoLoad = () => {
    setLogoLoaded(true)
  }

  return (
    <header>
      {/* Logo that links to homepage */}
      <Link to="/" className="header-link logo">
        <img src="logo-with-text.png" alt="bookshelved logo" className="logo-image" onLoad={handleLogoLoad} />
        {!logoLoaded && <div>Loading...</div>}
      </Link>
      <div className="header-right">
        {user && (
          // Magnifying glass symbol that links to search page
          <Link to="/book-search" className="header-link search">
            <span className="material-symbols-outlined">search</span>
          </Link>
        )}
        {user && (
          // Link to logged books page
          <Link to="/book-log" className="header-link books">
            LOGGED BOOKS
          </Link>
        )}
        {/* Login/Logout button */}
        <div className="header-link log-in">{!user ? <SignIn /> : <SignOut />}</div>
      </div>
    </header>
  )
}
