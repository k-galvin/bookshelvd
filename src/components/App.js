import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuthentication } from '../services/authService'
import BookSearchPage from './BookSearchPage'
import BookLogPage from './BookLogPage'
import Header from './Header'

function App() {
  const user = useAuthentication()

  return (
    <Router>
      <Header user={user} />

      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/book-search" element={<BookSearchPage user={user} />} />
        <Route path="/book-log" element={<BookLogPage user={user} />} />
      </Routes>
    </Router>
  )
}

export default App
