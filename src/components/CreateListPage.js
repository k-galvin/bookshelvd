import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks } from '../services/apiService'
import { createList } from '../services/bookService'
import LoginPage from './LoginPage'

export default function CreateListPage({ user }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [listBooks, setListBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const navigate = useNavigate()

  if (!user) return <LoginPage />

  const handleSearchSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const results = await searchBooks(searchQuery.trim())
      setSearchResults(results)
    } catch (err) {
      console.error('Error searching books for list:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const addBookToList = (book) => {
    const volumeId = book.id || book.volumeId
    if (listBooks.some(b => b.volumeId === volumeId)) return
    
    const info = book.volumeInfo
    const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
    const newBook = {
      volumeId,
      title: info.title,
      thumbnail: cover.replace('http://', 'https://'),
      authors: info.authors || []
    }
    setListBooks(prev => [...prev, newBook])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeBookFromList = (idx) => {
    setListBooks(prev => prev.filter((_, i) => i !== idx))
  }

  const moveBook = (idx, direction) => {
    const newIndex = idx + direction
    if (newIndex < 0 || newIndex >= listBooks.length) return
    const updated = [...listBooks]
    const temp = updated[idx]
    updated[idx] = updated[newIndex]
    updated[newIndex] = temp
    setListBooks(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a list name.')
      return
    }
    try {
      await createList(user, name.trim(), description.trim(), listBooks)
      navigate('/lists')
    } catch (err) {
      console.error('Error saving list:', err)
      alert('Failed to save list.')
    }
  }

  return (
    <div className="create-list-page">
      <div className="book-log-header">
        <h2 className="book-log-title">NEW LIST</h2>
      </div>

      <div className="create-list-layout">
        {/* Left Form */}
        <form onSubmit={handleSubmit} className="list-form-main">
          <div className="form-group">
            <label htmlFor="list-name">LIST NAME</label>
            <input
              id="list-name"
              type="text"
              className="log-input"
              placeholder="e.g. My Favorite Sci-Fi Books..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="list-description">DESCRIPTION</label>
            <textarea
              id="list-description"
              className="log-input review-text"
              placeholder="Add a description for this list..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* List Books Ordering Panel */}
          <div className="list-books-order-section">
            <label>BOOKS IN LIST ({listBooks.length})</label>
            {listBooks.length > 0 ? (
              <div className="ordered-books-list">
                {listBooks.map((book, idx) => (
                  <div key={book.volumeId + idx} className="ordered-book-row">
                    <span className="row-order-number">{idx + 1}</span>
                    <img src={book.thumbnail || '/placeholder-cover.png'} alt={book.title} className="order-row-cover" />
                    <div className="order-row-info">
                      <span className="order-row-title">{book.title}</span>
                      <span className="order-row-author">By {book.authors?.join(', ')}</span>
                    </div>
                    <div className="order-row-controls">
                      <button 
                        type="button" 
                        onClick={() => moveBook(idx, -1)} 
                        disabled={idx === 0} 
                        className="order-btn"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveBook(idx, 1)} 
                        disabled={idx === listBooks.length - 1} 
                        className="order-btn"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeBookFromList(idx)} 
                        className="remove-btn-icon"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-list-placeholder">
                <p>No books added to this list yet. Search on the right to add some!</p>
              </div>
            )}
          </div>

          <div className="log-modal-actions" style={{ marginTop: '2em', justifyContent: 'flex-start' }}>
            <button type="submit" className="save-btn">SAVE LIST</button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/lists')}>CANCEL</button>
          </div>
        </form>

        {/* Right Search Panel */}
        <aside className="list-search-aside">
          <h4>ADD BOOKS</h4>
          <form onSubmit={handleSearchSubmit} className="list-aside-search-bar">
            <input
              type="text"
              placeholder="Search by title, author..."
              className="log-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="save-btn">SEARCH</button>
          </form>

          {searchLoading && (
            <div className="spinner-container small">
              <div className="spinner"></div>
            </div>
          )}

          <div className="list-aside-search-results">
            {searchResults.map(result => {
              const info = result.volumeInfo
              const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ''
              return (
                <div 
                  key={result.id} 
                  className="list-search-result-row"
                  onClick={() => addBookToList(result)}
                  title="Click to add to list"
                >
                  <img src={cover} alt={info.title} />
                  <div className="search-result-row-info">
                    <span className="result-row-title">{info.title}</span>
                    <span className="result-row-author">{info.authors?.join(', ')}</span>
                  </div>
                  <span className="material-symbols-outlined add-icon-hover">add_circle</span>
                </div>
              )}
            )}
            {searchResults.length === 0 && searchQuery && !searchLoading && (
              <div className="no-results" style={{ padding: '1em' }}>No books found.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
