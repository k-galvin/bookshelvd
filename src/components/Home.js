import { useState, useEffect, useCallback } from 'react'
import { searchBooks } from '../services/apiService'
import LoginPage from './LoginPage'
import AuthorList from './AuthorList'

export default function Home({ user, addBook, deleteBook, loggedBooks }) {
  const authors = [
    'Joan Didion',
    'Lucy Foley',
    'Taylor Jenkins Reid',
    'Stephanie Garber',
    'Christelle Dabos',
    'Leigh Bardugo',
    'Marissa Meyer'
  ]
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authorBooks, setAuthorBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getRandomAuthor = () => {
    const randomIndex = Math.floor(Math.random() * authors.length)
    return authors[randomIndex]
  }

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

  useEffect(() => {
    const newSelectedAuthor = getRandomAuthor()
    setSelectedAuthor(newSelectedAuthor)
  }, [])

  useEffect(() => {
    if (selectedAuthor) {
      setLoading(true)
      fetchBooksForAuthor(selectedAuthor)
    }
  }, [selectedAuthor])

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="home-page">
      <h2>Featured Author: {selectedAuthor}</h2>

      {error ? (
        <div className="error">Error Displaying: {error.message}</div>
      ) : loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
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
