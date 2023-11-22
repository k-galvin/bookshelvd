import { Link } from 'react-router-dom'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  return (
    <header>
      <Link to="/" className="header-link">
        HOME
      </Link>
      <Link to="/book-search" className="header-link">
        BOOK SEARCH
      </Link>
      <Link to="/book-log" className="header-link">
        BOOK LOG
      </Link>

      {!user ? <SignIn /> : <SignOut />}
    </header>
  )
}
