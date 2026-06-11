import { useState, useEffect } from 'react'
import { searchBooks } from '../services/apiService'
import { SignIn } from '../services/authService'

export default function LoginPage() {
  const [backgroundBooks, setBackgroundBooks] = useState([])

  useEffect(() => {
    // Fetch books by user's favorite authors to populate the background cover wall
    const loadBackgroundCovers = async () => {
      const authors = [
        'Joan Didion',
        'Deborah Levy',
        'Vincenzo Latronico',
        'Rachel Cusk',
        'Patti Smith',
        'William Finnegan'
      ]
      
      try {
        // Run searches in parallel
        const promises = authors.map(author => searchBooks(`inauthor:${author}`))
        const results = await Promise.all(promises)
        
        // Flatten and extract items
        const allBooks = results.flat()
        
        // Filter out books without thumbnails
        const booksWithCovers = allBooks.filter(
          book => book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail
        )
        
        // Shuffle the books
        const shuffled = booksWithCovers.sort(() => 0.5 - Math.random())
        
        // Take up to 24 books for the grid wall
        setBackgroundBooks(shuffled.slice(0, 24))
      } catch (err) {
        console.error('Error fetching background covers:', err)
      }
    }
    loadBackgroundCovers()
  }, [])

  // Helper to ensure image URLs are HTTPS
  const ensureHttps = (url) => {
    if (!url) return null;
    return url.replace('http://', 'https://');
  };

  return (
    <div className="login-page-container">
      {/* Background Cover Wall */}
      <div className="cover-wall">
        {backgroundBooks.map((book, idx) => {
          const cover = ensureHttps(book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail);
          return (
            <div key={book.id + '-' + idx} className="cover-wall-item">
              <img src={cover} alt={book.volumeInfo.title} />
            </div>
          )
        })}
        {/* If background books are loading or empty, show a grid placeholder */}
        {backgroundBooks.length === 0 && (
          Array.from({ length: 24 }).map((_, idx) => (
            <div key={idx} className="cover-wall-item placeholder" />
          ))
        )}
      </div>

      <div className="cover-wall-overlay"></div>

      {/* Hero Content */}
      <div className="login-hero-content">
        <h1 className="hero-brand">BOOKSHELVD</h1>
        <h2 className="hero-tagline">
          Track books you’ve read.<br />
          Save those you want to read.<br />
          Tell your friends what’s good.
        </h2>
        
        <p className="hero-subtext">
          The social network for book lovers. Sign in to start your reading diary, rate titles, and compile your TBR list.
        </p>

        <div className="hero-cta">
          <SignIn />
        </div>
      </div>
    </div>
  )
}

