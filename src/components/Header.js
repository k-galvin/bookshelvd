import { Link } from 'react-router-dom'
import { SignIn, SignOut } from '../services/authService'

export default function Header({ user }) {
  return (
    <header>
      <Link to="/">Home</Link>
      <Link to="/book-search">Book Search</Link>
      <Link to="/book-log">Book Log</Link>

      {!user ? <SignIn /> : <SignOut />}
    </header>
  )
}
