import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import LoginPage from './LoginPage'
import AuthorList from './AuthorList'

export default function Home({ user, addBook, deleteBook, loggedBooks }) {
  const authors = [
    'Charles Dickens',
    'Joan Didion',
    'Lucy Foley',
    'Taylor Jenkins Reid',
    'Kerstin Gier',
    'E.M. Forster',
    'Jennifer Lynn Barnes'
  ]
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [authorBooks, setAuthorBooks] = useState([])
  const [loading, setLoading] = useState(true)

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

      {loading ? (
        'Loading...'
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
