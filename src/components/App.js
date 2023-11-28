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
  const user = useAuthentication()

  // Fetch all logged books from firebase
  useEffect(() => {
    if (user) {
      fetchLoggedBooks(user.uid).then(setLoggedBooks)
    }
  }, [user, loggedBooks.length])

  // Handling function for deleting a book from firestore
  const deleteBook = async (user, book) => {
    try {
      await removeLoggedBook(user, book.id)
      setLoggedBooks(prevBooks => prevBooks.filter(prevBook => prevBook.id !== book.id))
    } catch (error) {
      console.error('Error removing book:', error)
    }
  }

  // Handling function for adding a book to firestore
  const addBook = async (user, book) => {
    try {
      await logBook(user, book)
      setLoggedBooks(prevBooks => [...prevBooks, book])
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  return (
    <div className="app-container">
      <Router>
        <Header user={user} />

        <div className="pages-container">
          <Routes>
            <Route
              path="/"
              element={<Home user={user} addBook={addBook} deleteBook={deleteBook} loggedBooks={loggedBooks} />}
            />
            <Route
              path="/book-search"
              element={
                <BookSearchPage user={user} addBook={addBook} deleteBook={deleteBook} loggedBooks={loggedBooks} />
              }
            />
            <Route
              path="/book-log"
              element={<BookLogPage user={user} addBook={addBook} deleteBook={deleteBook} loggedBooks={loggedBooks} />}
            />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
