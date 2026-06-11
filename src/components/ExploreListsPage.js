import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchLists, fetchAllPublicLists, deleteList } from '../services/bookService'
import LoginPage from './LoginPage'

export default function ExploreListsPage({ user }) {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'mine' ? 'mine' : 'popular'
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const [myLists, setMyLists] = useState([])
  const [publicLists, setPublicLists] = useState([])
  const [loading, setLoading] = useState(true)

  // Sync tab state with URL parameter if it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'mine') {
      setActiveTab('mine')
    } else if (tabParam === 'popular') {
      setActiveTab('popular')
    }
  }, [searchParams])

  useEffect(() => {
    const loadAllListsData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const [myListsData, publicListsData] = await Promise.all([
          fetchLists(user.uid),
          fetchAllPublicLists()
        ])

        setMyLists(myListsData)
        
        // Sort public lists by book count desc (popularity indicator)
        const sortedPublic = [...publicListsData].sort((a, b) => {
          return (b.books?.length || 0) - (a.books?.length || 0)
        })
        setPublicLists(sortedPublic)
      } catch (err) {
        console.error('Error fetching lists data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAllListsData()
  }, [user])

  const handleDelete = async (e, listId) => {
    e.stopPropagation()
    e.preventDefault()
    if (!window.confirm('Are you sure you want to delete this list?')) return
    try {
      await deleteList(user.uid, listId)
      setMyLists(prev => prev.filter(l => l.id !== listId))
      setPublicLists(prev => prev.filter(l => l.id !== listId))
    } catch (err) {
      console.error('Error deleting list:', err)
    }
  }

  if (!user) return <LoginPage />

  const currentLists = activeTab === 'mine' ? myLists : publicLists

  return (
    <div className="lists-page-container">
      <div className="book-log-header lists-header-discover">
        <div className="lists-header-left">
          <h2 className="book-log-title">EXPLORE LISTS</h2>
          <span className="diary-total-count">Collect and compile user selections</span>
        </div>
        <Link to="/lists/new" className="dashboard-link-btn" style={{ margin: 0, textDecoration: 'none' }}>
          Create a list...
        </Link>
      </div>

      {/* Lists Tabs */}
      <div className="lists-discover-tabs">
        <button 
          className={`lists-tab-btn ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          POPULAR LISTS
        </button>
        <button 
          className={`lists-tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}
        >
          MY LISTS
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : currentLists.length > 0 ? (
        <div className="lists-stack">
          {currentLists.map(list => {
            const previewBooks = list.books?.slice(0, 5) || []
            const isOwner = list.userId === user.uid || !list.userId // Fallback if no userId
            
            return (
              <Link key={list.id} to={`/list/${list.id}`} className="list-card-link">
                <div className="list-card-container">
                  <div className="list-card-info">
                    <h3 className="list-card-name">{list.name}</h3>
                    {list.description && <p className="list-card-desc">{list.description}</p>}
                    <div className="list-card-metadata-row">
                      <span className="list-card-meta">{list.books?.length || 0} book(s)</span>
                      {!isOwner && list.name && (
                        <span className="list-card-author-badge">Public List</span>
                      )}
                    </div>
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
                    {isOwner && (
                      <button 
                        className="diary-action-btn delete-btn" 
                        onClick={(e) => handleDelete(e, list.id)}
                        title="Delete List"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="empty-state-card">
          {activeTab === 'mine' ? (
            <>
              <p>You haven't created any custom lists yet. Share your favorite books by compiling them into a list!</p>
              <Link to="/lists/new" className="dashboard-link-btn" style={{ textDecoration: 'none' }}>Create your first list</Link>
            </>
          ) : (
            <p>No popular public lists compiled yet. Be the first to compile one!</p>
          )}
        </div>
      )}
    </div>
  )
}
