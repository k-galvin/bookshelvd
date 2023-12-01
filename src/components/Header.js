import { Link } from 'react-router-dom'
import { useState } from 'react'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  const [logoLoaded, setLogoLoaded] = useState(false)

  const handleLogoLoad = () => {
    setLogoLoaded(true)
  }

  return (
    <header>
      <Link to="/" className="header-link logo">
        <img
          src="logo-with-text.png"
          alt="bookshelved logo"
          className={`logo-image ${logoLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleLogoLoad}
        />
        {!logoLoaded && <div className="loading-message">Loading...</div>}
      </Link>
      <div className="header-right">
        <Link to="/book-search" className="header-link search">
          <span className="material-symbols-outlined">search</span>
        </Link>
        <Link to="/book-log" className="header-link books">
          LOGGED BOOKS
        </Link>
        <div className="header-link log-in">{!user ? <SignIn /> : <SignOut />}</div>
      </div>
    </header>
  )
}
