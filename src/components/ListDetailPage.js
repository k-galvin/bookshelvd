import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchListById, deleteList, updateList, toggleLikeList } from '../services/bookService'
import LoginPage from './LoginPage'
import Book from './Book'

export default function ListDetailPage({ user, loggedBooks = [], tbr = [], addBook, deleteBook, updateBook, handleAddToTBR, lists = [], onAssignToList, onMarkAsRead, onUpdateBookRating, onUpdateList }) {
  const { listId } = useParams()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const navigate = useNavigate()

  const isOwner = !list || !list.userId || list.userId === user.uid

  const handleLikeToggle = async () => {
    if (!list || !user) return

    const ownerId = list.userId || user.uid
    const likesList = list.likes || []
    const hasLiked = likesList.includes(user.uid)

    try {
      await toggleLikeList(ownerId, list.id, user.uid, hasLiked)

      const updatedLikes = hasLiked
        ? likesList.filter(uid => uid !== user.uid)
        : [...likesList, user.uid]

      setList(prev => ({
        ...prev,
        likes: updatedLikes,
        likesCount: updatedLikes.length
      }))
    } catch (err) {
      console.error('Error toggling list like:', err)
    }
  }

  useEffect(() => {
    if (list) {
      setEditName(list.name)
      setEditDesc(list.description || '')
    }
  }, [list])

  useEffect(() => {
    const loadList = async () => {
      if (!user || !listId) return
      try {
        setLoading(true)
        const data = await fetchListById(user.uid, listId)
        setList(data)
      } catch (err) {
        console.error('Error fetching list:', err)
      } finally {
        setLoading(false)
      }
    }
    loadList()
  }, [user, listId])

  const handleSaveTitle = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    try {
      await updateList(user.uid, list.id, { name: editName.trim(), description: editDesc.trim() })
      setList(prev => ({ ...prev, name: editName.trim(), description: editDesc.trim() }))
      setIsEditing(false)
      if (onUpdateList) {
        onUpdateList(list.id, { name: editName.trim(), description: editDesc.trim() })
      }
    } catch (err) {
      console.error('Error updating list title and description:', err)
    }
  }

  const handleDelete = async () => {
    if (!list) return
    if (!window.confirm('Are you sure you want to delete this list?')) return
    try {
      await deleteList(user.uid, list.id)
      navigate('/lists')
    } catch (err) {
      console.error('Error deleting list:', err)
    }
  }

  if (!user) return <LoginPage />
  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>
  if (!list) return <div className="pages-container">List not found.</div>

  return (
    <div className="list-detail-page-container">
      {/* List Header */}
      <div className="list-detail-header-card">
        <div className="list-detail-title-info">
          <Link to="/lists" className="back-to-lists-link">← Back to Lists</Link>
          {isEditing ? (
            <form onSubmit={handleSaveTitle} className="edit-list-title-form">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="edit-list-title-input"
                placeholder="List Title"
                required
                autoFocus
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="edit-list-subtitle-input"
                placeholder="Add list subtitle..."
              />
              <div className="edit-list-title-actions">
                <button type="submit" className="user-button save-btn">Save</button>
                <button type="button" onClick={() => { setIsEditing(false); setEditName(list.name); setEditDesc(list.description || ''); }} className="user-button cancel-btn">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="list-title-display-row">
              <h2 className="list-detail-name">{list.name}</h2>
              {isOwner && (
                <button onClick={() => setIsEditing(true)} className="edit-list-title-btn" title="Edit List Title">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              )}
            </div>
          )}
          {list.description && <p className="list-detail-desc">{list.description}</p>}
          <div className="list-detail-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '6px' }}>
            <span className="list-detail-count">
              {list.books?.length || 0} book(s) compiled by {isOwner ? 'you' : 'another user'}
            </span>
            <button 
              className={`list-like-btn ${list.likes?.includes(user.uid) ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              title={list.likes?.includes(user.uid) ? 'Unlike List' : 'Like List'}
            >
              <span className="material-symbols-outlined heart-icon">favorite</span>
              <span className="likes-count">{list.likesCount || list.likes?.length || 0}</span>
            </button>
          </div>
        </div>
        {isOwner && (
          <div className="list-detail-actions-sidebar">
            <button onClick={handleDelete} className="user-button delete-action-btn">
              Delete List
            </button>
          </div>
        )}
      </div>

      {/* Book Cards Grid */}
      {list.books && list.books.length > 0 ? (
        <div className="books-container">
          {list.books.map(book => (
            <div key={book.volumeId} className="small-book-container">
              <Book
                book={{...book, id: book.volumeId}}
                cover={book.thumbnail}
                loggedBooks={loggedBooks}
                tbr={tbr}
                addBook={addBook}
                deleteBook={deleteBook}
                updateBook={updateBook}
                user={user}
                addToTBR={handleAddToTBR}
                title={book.title}
                authors={book.authors}
                size="small"
                lists={lists}
                onAssignToList={onAssignToList}
                onMarkAsRead={onMarkAsRead}
                onUpdateBookRating={onUpdateBookRating}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card" style={{ marginTop: '2em' }}>
          <p>This list is empty.</p>
        </div>
      )}
    </div>
  )
}
