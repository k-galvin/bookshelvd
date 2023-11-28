import { Link } from 'react-router-dom'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  return (
    <header>
      <Link to="/" className="header-link logo">
        <img src="logo-with-text.png" alt="bookshelved logo" className="logo-image"></img>
      </Link>
      <Link to="/book-search" className="header-link search">
        <span class="material-symbols-outlined">search</span>
      </Link>
      <Link to="/book-log" className="header-link books">
        LOGGED BOOKS
      </Link>
      <div className="header-link log-in">{!user ? <SignIn /> : <SignOut />}</div>
    </header>
  )
}
