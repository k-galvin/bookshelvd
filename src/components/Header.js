import { Link } from 'react-router-dom'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  return (
    <header>
      <div className="header-left">
        {/* Logo that links to homepage */}
        <Link to="/" className="header-link logo">
          <img src="logo-with-text.png" alt="bookshelved logo" className="logo-image" />
        </Link>
      </div>

      <div className="header-right">
        {user && (
          <>
            {/* Magnifying glass symbol that links to search page */}
            <Link to="/book-search" className="header-link">
              SEARCH
            </Link>
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
