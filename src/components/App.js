import './App.css'

import { logBook, removeLoggedBook, fetchLoggedBooks } from '../services/bookService'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuthentication } from '../services/authService'
import { useState, useEffect } from 'react'

import BookSearchPage from './BookSearchPage'
import BookLogPage from './BookLogPage'
import Header from './Header'

function App() {
  const [loggedBooks, setLoggedBooks] = useState([])
  const user = useAuthentication()

  // Fetch all logged books from firebase
  useEffect(() => {
    if (user) {
      fetchLoggedBooks(user.uid).then(setLoggedBooks)
    }
  }, [user])

  // Handling function for deleting a book from firestore
  const deleteBook = async (user, book) => {
    try {
      await removeLoggedBook(user, book.id)
    } catch (error) {
      console.error('Error removing book:', error)
    }
  }

  // Handling function for adding a book to firestore
  const addBook = async (user, book) => {
    try {
      await logBook(user, book)
    } catch (error) {
      console.error('Error adding book:', error)
    }
  }

  return (
    <Router>
      <Header user={user} />

      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/book-search" element={<BookSearchPage user={user} addBook={addBook} />} />
        <Route
          path="/book-log"
          element={<BookLogPage user={user} deleteBook={deleteBook} loggedBooks={loggedBooks} />}
        />
      </Routes>
    </Router>
  )
}

export default App
