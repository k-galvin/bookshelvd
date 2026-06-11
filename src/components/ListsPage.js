import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchLists, deleteList } from '../services/bookService'
import LoginPage from './LoginPage'
import ProfileHeader from './ProfileHeader'

export default function ListsPage({ user }) {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLists = async () => {
      if (!user) return
      try {
        setLoading(true)
        const data = await fetchLists(user.uid)
        setLists(data)
      } catch (err) {
        console.error('Error fetching lists:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLists()
  }, [user])

  const handleDelete = async (e, listId) => {
    e.stopPropagation()
    e.preventDefault()
    if (!window.confirm('Are you sure you want to delete this list?')) return
    try {
      await deleteList(user.uid, listId)
      setLists(prev => prev.filter(l => l.id !== listId))
    } catch (err) {
      console.error('Error deleting list:', err)
    }
  }

  if (!user) return <LoginPage />

  return (
    <div className="lists-page-container">
      <ProfileHeader user={user} />
      <div className="book-log-header">
        <h2 className="book-log-title">YOUR LISTS</h2>
        <Link to="/lists/new" className="dashboard-link-btn" style={{ margin: 0, textDecoration: 'none' }}>
          Create a list...
        </Link>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : lists.length > 0 ? (
        <div className="lists-stack">
          {lists.map(list => {
            const previewBooks = list.books?.slice(0, 5) || []
            return (
              <Link key={list.id} to={`/list/${list.id}`} className="list-card-link">
                <div className="list-card-container">
                  <div className="list-card-info">
                    <h3 className="list-card-name">{list.name}</h3>
                    {list.description && <p className="list-card-desc">{list.description}</p>}
                    <span className="list-card-meta">{list.books?.length || 0} book(s)</span>
                  </div>

                  <div className="list-card-preview-shelf">
                    {previewBooks.map((book, idx) => (
                      <div key={book.volumeId + idx} className="list-preview-cover-slot" style={{ zIndex: 10 - idx }}>
                        <img src={book.thumbnail || '/placeholder-cover.png'} alt={book.title} />
                      </div>
                    ))}
                    {previewBooks.length === 0 && (
                      <div className="list-preview-empty">Empty list</div>
                    )}
                  </div>

                  <div className="list-card-actions">
                    <button 
                      className="diary-action-btn delete-btn" 
                      onClick={(e) => handleDelete(e, list.id)}
                      title="Delete List"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="empty-state-card">
          <p>You haven't created any custom lists yet. Share your favorite books by compiling them into a list!</p>
          <Link to="/lists/new" className="dashboard-link-btn" style={{ textDecoration: 'none' }}>Create your first list</Link>
        </div>
      )}
    </div>
  )
}
