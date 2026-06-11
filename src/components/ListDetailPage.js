import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchListById, deleteList } from '../services/bookService'
import LoginPage from './LoginPage'
import Book from './Book'

export default function ListDetailPage({ user, loggedBooks = [], tbr = [], addBook, deleteBook, updateBook, handleAddToTBR, lists = [], onAssignToList, onMarkAsRead, onUpdateBookRating }) {
  const { listId } = useParams()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
          <h2 className="list-detail-name">{list.name}</h2>
          {list.description && <p className="list-detail-desc">{list.description}</p>}
          <span className="list-detail-count">{list.books?.length || 0} book(s) compiled by you</span>
        </div>
        <div className="list-detail-actions-sidebar">
          <button onClick={handleDelete} className="user-button delete-action-btn">
            Delete List
          </button>
        </div>
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
