import './App.css'

import { logBook, removeLoggedBook, fetchLoggedBooks } from '../services/bookService'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuthentication } from '../services/authService'
import { useState, useEffect } from 'react'

import BookSearchPage from './BookSearchPage'
import BookLogPage from './BookLogPage'
import Header from './Header'
import Home from './Home'

function App() {
  const [loggedBooks, setLoggedBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthentication()

  // Fetch all logged book data from firebase
  useEffect(() => {
    async function fetchData() {
      try {
        const books = await fetchLoggedBooks(user.uid)
        setLoggedBooks(books)
      } catch (error) {
        setError('Error fetching books: ' + error)
      } finally {
        setLoading(false)
      }
    }

    // Set loading status for logged books
    setLoading(true)

    if (user) {
      fetchData()
    }
  }, [user, loggedBooks.length])

  // Handling function for deleting a book from firestore
  const deleteBook = async (user, book) => {
    try {
      await removeLoggedBook(user, book.id)
      // Update logged books
      setLoggedBooks(prevBooks => prevBooks.filter(prevBook => prevBook.id !== book.id))
    } catch (error) {
      setError('Error removing book: ' + error.message)
    }
  }

  // Handling function for adding a book to firestore
  const addBook = async (user, book) => {
    try {
      await logBook(user, book)
      // Update logged books
      setLoggedBooks(prevBooks => [...prevBooks, book])
    } catch (error) {
      setError('Error adding book: ' + error.message)
    }
  }

  // Function used to close the error popup
  const closeErrorPopup = () => setError(false)

  return (
    <div className="app-container">
      <Router>
        {/* Header containing navigation and authentication */}
        <Header user={user} />

        {/* Firebase error message popup */}
        {error && (
          <div className="popup" onClick={closeErrorPopup}>
            <div className="popup-content error" onClick={e => e.stopPropagation()}>
              {error}
            </div>
          </div>
        )}

        <div className="pages-container">
          <Routes>
            {/* Home page */}
            <Route
              path="/"
              element={<Home user={user} addBook={addBook} deleteBook={deleteBook} loggedBooks={loggedBooks} />}
            />
            {/* Book search page */}
            <Route
              path="/book-search"
              element={
                <BookSearchPage user={user} addBook={addBook} deleteBook={deleteBook} loggedBooks={loggedBooks} />
              }
            />
            {/* Book Log Page */}
            <Route
              path="/book-log"
              element={
                <BookLogPage
                  user={user}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  loggedBooks={loggedBooks}
                  loading={loading}
                />
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
