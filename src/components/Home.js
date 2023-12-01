import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import LoginPage from './LoginPage'
import AuthorList from './AuthorList'

export default function Home({ user, addBook, deleteBook, loggedBooks }) {
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authorBooks, setAuthorBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetches books by an author
  const fetchBooksForAuthor = async author => {
    const query = 'inauthor:' + author
    try {
      const books = await searchBooks(query)
      setAuthorBooks(books)
    } catch (error) {
      setError(error)
      setAuthorBooks([])
    } finally {
      setLoading(false)
    }
  }

  // Choose a random author from a list
  useEffect(() => {
    // List of featured authors
    const authors = [
      'Joan Didion',
      'Lucy Foley',
      'Taylor Jenkins Reid',
      'Stephanie Garber',
      'Christelle Dabos',
      'Leigh Bardugo',
      'Marissa Meyer'
    ]

    // Select a random author from the list
    const getRandomAuthor = () => {
      const randomIndex = Math.floor(Math.random() * authors.length)
      return authors[randomIndex]
    }

    const newSelectedAuthor = getRandomAuthor()
    setSelectedAuthor(newSelectedAuthor)
  }, [])

  // Fetch books by the selected author
  useEffect(() => {
    if (selectedAuthor) {
      setLoading(true)
      fetchBooksForAuthor(selectedAuthor)
    }
  }, [selectedAuthor])

  // Display login page if not signed in
  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="home-page">
      <h2>Featured Author: {selectedAuthor}</h2>

      {/* Display error if books couldn't be fetched */}
      {error ? (
        <div className="error">Error Displaying Books: {error.message}</div>
      ) : loading ? (
        // Display loading spinner while books are being fetched
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        // Display five books by the selected author
        <AuthorList
          authorBooks={authorBooks}
          loggedBooks={loggedBooks}
          addBook={addBook}
          deleteBook={deleteBook}
          user={user}
        />
      )}
    </div>
  )
}
