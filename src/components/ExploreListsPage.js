import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchLists, fetchAllPublicLists, deleteList, toggleLikeList } from '../services/bookService'
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
      setLoading(true)
      
      try {
        const myListsData = await fetchLists(user.uid)
        setMyLists(myListsData)
      } catch (err) {
        console.error('Error fetching my lists:', err)
      }

      try {
        const publicListsData = await fetchAllPublicLists()
        const sortedPublic = [...publicListsData].sort((a, b) => {
          const likesA = a.likesCount || a.likes?.length || 0
          const likesB = b.likesCount || b.likes?.length || 0
          if (likesB !== likesA) return likesB - likesA
          return (b.books?.length || 0) - (a.books?.length || 0)
        })
        setPublicLists(sortedPublic)
      } catch (err) {
        console.error('Error fetching public lists:', err)
      }

      setLoading(false)
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

  const handleLikeToggle = async (e, list) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    const ownerId = list.userId || user.uid
    const likesList = list.likes || []
    const hasLiked = likesList.includes(user.uid)

    try {
      await toggleLikeList(ownerId, list.id, user.uid, hasLiked)

      const updateListState = l => {
        if (l.id === list.id) {
          const updatedLikes = hasLiked
            ? likesList.filter(uid => uid !== user.uid)
            : [...likesList, user.uid]
          return {
            ...l,
            likes: updatedLikes,
            likesCount: updatedLikes.length
          }
        }
        return l
      }

      setPublicLists(prev => prev.map(updateListState))
      setMyLists(prev => prev.map(updateListState))
    } catch (err) {
      console.error('Error toggling list like:', err)
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
                      <button 
                        className={`list-like-btn ${list.likes?.includes(user.uid) ? 'liked' : ''}`}
                        onClick={(e) => handleLikeToggle(e, list)}
                        title={list.likes?.includes(user.uid) ? 'Unlike List' : 'Like List'}
                      >
                        <span className="material-symbols-outlined heart-icon">favorite</span>
                        <span className="likes-count">{list.likesCount || list.likes?.length || 0}</span>
                      </button>
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
