import './App.css'

import { logBook, removeLoggedBook, fetchLoggedBooks, fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../services/bookService'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuthentication } from '../services/authService'
import { useState, useEffect } from 'react'

import BookSearchPage from './BookSearchPage'
import BookLogPage from './BookLogPage'
import TBRPage from './TBRPage'
import BookDetailPage from './BookDetailPage'
import Header from './Header'
import Home from './Home'

function App() {
  const [loggedBooks, setLoggedBooks] = useState([])
  const [tbr, setTBR] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthentication()

  // Fetch all logged book data and tbr from firebase
  useEffect(() => {
    async function fetchData() {
      try {
        const [books, tbrBooks] = await Promise.all([
          fetchLoggedBooks(user.uid),
          fetchWatchlist(user.uid)
        ])
        setLoggedBooks(books)
        setTBR(tbrBooks)
      } catch (error) {
        setError('Error fetching data: ' + error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      setLoading(true)
      fetchData()
    }
  }, [user])

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
  const addBook = async (user, book, logDetails = {}) => {
    try {
      const loggedBook = await logBook(user, book, logDetails)
      if (loggedBook) {
        // Update logged books
        setLoggedBooks(prevBooks => [...prevBooks, loggedBook])
        // If it was in tbr, remove it
        const volumeId = book.id || book.volumeId
        await removeFromWatchlist(user, volumeId)
        setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
      }
    } catch (error) {
      setError('Error adding book: ' + error.message)
    }
  }

  const handleAddToTBR = async (user, book) => {
    try {
      const volumeId = book.id || book.volumeId
      const isInTBR = tbr.some(b => b.volumeId === volumeId)
      
      if (isInTBR) {
        await removeFromWatchlist(user, volumeId)
        setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
      } else {
        await addToWatchlist(user, book)
        // Refresh tbr to get the new list with IDs
        const updatedTBR = await fetchWatchlist(user.uid)
        setTBR(updatedTBR)
      }
    } catch (error) {
      setError('Error updating TBR: ' + error.message)
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
              element={
                <Home 
                  user={user} 
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
                />
              }
            />
            {/* Book search page */}
            <Route
              path="/book-search"
              element={
                <BookSearchPage 
                  user={user} 
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
                />
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
                  tbr={tbr}
                  loading={loading}
                  addToTBR={handleAddToTBR}
                />
              }
            />
            {/* TBR Page */}
            <Route
              path="/tbr"
              element={
                <TBRPage
                  user={user}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  handleAddToTBR={handleAddToTBR}
                />
              }
            />
            {/* Book Detail Page */}
            <Route
              path="/book/:id"
              element={
                <BookDetailPage
                  user={user}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
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
