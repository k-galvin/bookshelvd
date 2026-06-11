import './App.css'

import { 
  logBook, 
  removeLoggedBook, 
  fetchLoggedBooks, 
  fetchTBR, 
  addToTBR, 
  removeFromTBR, 
  updateLoggedBook,
  fetchFavorites,
  saveFavorites,
  fetchLists,
  addBookToList,
  removeBookFromList
} from '../services/bookService'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuthentication } from '../services/authService'
import { useState, useEffect } from 'react'

import BookSearchPage from './BookSearchPage'
import BookLogPage from './BookLogPage'
import TBRPage from './TBRPage'
import BookDetailPage from './BookDetailPage'
import Header from './Header'
import Home from './Home'
import ProfilePage from './ProfilePage'
import DiaryPage from './DiaryPage'
import LikedPage from './LikedPage'
import ListsPage from './ListsPage'
import CreateListPage from './CreateListPage'
import ListDetailPage from './ListDetailPage'
import DiscoverBooksPage from './DiscoverBooksPage'
import ExploreListsPage from './ExploreListsPage'
import AuthorPage from './AuthorPage'

const getMostRecentLog = (loggedBooks, volumeId) => {
  if (!loggedBooks) return null
  const matched = loggedBooks.filter(lb => lb.volumeId === volumeId)
  if (matched.length === 0) return null
  
  const getMs = (val) => {
    if (!val) return 0;
    if (typeof val.toMillis === 'function') return val.toMillis();
    if (val.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
    return new Date(val).getTime();
  };

  return [...matched].sort((a, b) => {
    const timeA = getMs(a.dateRead) || getMs(a.createdAt);
    const timeB = getMs(b.dateRead) || getMs(b.createdAt);
    return timeB - timeA;
  })[0];
}

function App() {
  const [loggedBooks, setLoggedBooks] = useState([])
  const [tbr, setTBR] = useState([])
  const [favorites, setFavorites] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthentication()

  // Fetch all logged book data, tbr and favorites from firebase
  useEffect(() => {
    async function fetchData() {
      try {
        const [books, tbrBooks, favBooks, userLists] = await Promise.all([
          fetchLoggedBooks(user.uid),
          fetchTBR(user.uid),
          fetchFavorites(user.uid),
          fetchLists(user.uid)
        ])
        setLoggedBooks(books)
        setTBR(tbrBooks)
        setFavorites(favBooks)
        setLists(userLists)
      } catch (error) {
        setError('Error fetching data: ' + error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      setLoading(true)
      fetchData()
    }
  }, [user])

  // Handling function for deleting a book from firestore
  const deleteBook = async (user, book) => {
    try {
      await removeLoggedBook(user, book.id)
      // Update logged books
      setLoggedBooks(prevBooks => prevBooks.filter(prevBook => prevBook.id !== book.id))
    } catch (error) {
      setError('Error removing book: ' + error.message)
    }
  }

  // Handling function for adding a book to firestore
  const addBook = async (user, book, logDetails = {}) => {
    try {
      // Map logDetails from LogModal to the format expected by logBook service
      const formattedDetails = {
        rating: logDetails.userRating,
        review: logDetails.userReview,
        dateRead: logDetails.dateRead,
        isLiked: logDetails.isLiked,
        readCount: logDetails.readCount
      }

      const loggedBook = await logBook(user, book, formattedDetails)
      if (loggedBook) {
        // Update logged books
        setLoggedBooks(prevBooks => [...prevBooks, loggedBook])
        // If it was in tbr, remove it
        const volumeId = book.id || book.volumeId
        await removeFromTBR(user, volumeId)
        setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
      }
    } catch (error) {
      setError('Error adding book: ' + error.message)
    }
  }

  // Handling function for updating an existing log
  const updateBook = async (user, logId, updates) => {
    try {
      await updateLoggedBook(user, logId, updates)
      // Update local state
      setLoggedBooks(prevBooks => 
        prevBooks.map(book => book.id === logId ? { ...book, ...updates } : book)
      )
    } catch (error) {
      setError('Error updating log: ' + error.message)
    }
  }

  const handleAddToTBR = async (user, book) => {
    try {
      const volumeId = book.id || book.volumeId
      const isInTBR = tbr.some(b => b.volumeId === volumeId)
      
      if (isInTBR) {
        await removeFromTBR(user, volumeId)
        setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
      } else {
        await addToTBR(user, book)
        // Refresh tbr to get the new list with IDs
        const updatedTBR = await fetchTBR(user.uid)
        setTBR(updatedTBR)
      }
    } catch (error) {
      setError('Error updating TBR: ' + error.message)
    }
  }

  const handleMarkAsRead = async (user, book) => {
    try {
      const volumeId = book.id || book.volumeId
      const loggedInstance = getMostRecentLog(loggedBooks, volumeId)
      
      if (loggedInstance) {
        await deleteBook(user, loggedInstance)
      } else {
        const loggedBook = await logBook(user, book, { dateRead: null })
        if (loggedBook) {
          setLoggedBooks(prevBooks => [...prevBooks, loggedBook])
          await removeFromTBR(user, volumeId)
          setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
        }
      }
    } catch (error) {
      setError('Error toggling read status: ' + error.message)
    }
  }

  const handleUpdateBookRating = async (user, book, rating) => {
    try {
      const volumeId = book.id || book.volumeId
      const loggedInstance = getMostRecentLog(loggedBooks, volumeId)

      if (loggedInstance) {
        await updateBook(user, loggedInstance.id, { userRating: rating })
      } else {
        const loggedBook = await logBook(user, book, { rating, dateRead: null })
        if (loggedBook) {
          setLoggedBooks(prevBooks => [...prevBooks, loggedBook])
          await removeFromTBR(user, volumeId)
          setTBR(prev => prev.filter(b => b.volumeId !== volumeId))
        }
      }
    } catch (error) {
      setError('Error updating book rating: ' + error.message)
    }
  }

  const handleAssignToList = async (user, listId, book, shouldAdd) => {
    try {
      let updatedBooks;
      const formattedBook = {
        volumeId: book.id || book.volumeId,
        title: book.volumeInfo?.title || book.title,
        thumbnail: book.volumeInfo?.imageLinks?.thumbnail || book.thumbnail || '',
        authors: book.volumeInfo?.authors || book.authors || []
      }

      if (shouldAdd) {
        updatedBooks = await addBookToList(user.uid, listId, formattedBook)
      } else {
        updatedBooks = await removeBookFromList(user.uid, listId, formattedBook.volumeId)
      }

      setLists(prevLists => 
        prevLists.map(l => l.id === listId ? { ...l, books: updatedBooks } : l)
      )
    } catch (error) {
      setError('Error assigning book to list: ' + error.message)
    }
  }

  const handleUpdateFavorites = async (newFavorites) => {
    try {
      await saveFavorites(user.uid, newFavorites)
      setFavorites(newFavorites)
    } catch (error) {
      setError('Error updating favorites: ' + error.message)
    }
  }

  // Function used to close the error popup
  const closeErrorPopup = () => setError(false)

  return (
    <div className="app-container">
      <Router>
        {/* Header containing navigation and authentication */}
        <Header user={user} addBook={addBook} />

        {/* Firebase error message popup */}
        {error && (
          <div className="popup" onClick={closeErrorPopup}>
            <div className="popup-content error" onClick={e => e.stopPropagation()}>
              {error}
            </div>
          </div>
        )}

        <div className="pages-container">
          <Routes>
            {/* Home page */}
            <Route
              path="/"
              element={
                <Home 
                  user={user} 
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  updateBook={updateBook}
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Book search page */}
            <Route
              path="/book-search"
              element={
                <BookSearchPage 
                  user={user} 
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  updateBook={updateBook}
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Book Log Page */}
            <Route
              path="/book-log"
              element={
                <BookLogPage
                  user={user}
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  updateBook={updateBook}
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  loading={loading}
                  addToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Discover Books Page */}
            <Route
              path="/books"
              element={
                <DiscoverBooksPage
                  user={user}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                  handleAddToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* TBR Page */}
            <Route
              path="/tbr"
              element={
                <TBRPage
                  user={user}
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  updateBook={updateBook}
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  handleAddToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Book Detail Page */}
            <Route
              path="/book/:id"
              element={
                <BookDetailPage
                  user={user}
                  addBook={addBook} 
                  deleteBook={deleteBook} 
                  updateBook={updateBook}
                  loggedBooks={loggedBooks} 
                  tbr={tbr}
                  addToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <ProfilePage
                  user={user}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  favorites={favorites}
                  updateFavorites={handleUpdateFavorites}
                />
              }
            />
            {/* Diary Page */}
            <Route
              path="/diary"
              element={
                <DiaryPage
                  user={user}
                  loggedBooks={loggedBooks}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                />
              }
            />
            {/* Liked Books Page */}
            <Route
              path="/liked"
              element={
                <LikedPage
                  user={user}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                  handleAddToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Explore Lists Page */}
            <Route
              path="/lists"
              element={
                <ExploreListsPage
                  user={user}
                />
              }
            />
            {/* My Lists Page */}
            <Route
              path="/my-lists"
              element={
                <ListsPage
                  user={user}
                />
              }
            />
            {/* Create List Page */}
            <Route
              path="/lists/new"
              element={
                <CreateListPage
                  user={user}
                />
              }
            />
            {/* List Detail Page */}
            <Route
              path="/list/:listId"
              element={
                <ListDetailPage
                  user={user}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                  handleAddToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
            {/* Author Page */}
            <Route
              path="/author/:authorName"
              element={
                <AuthorPage
                  user={user}
                  loggedBooks={loggedBooks}
                  tbr={tbr}
                  addBook={addBook}
                  deleteBook={deleteBook}
                  updateBook={updateBook}
                  handleAddToTBR={handleAddToTBR}
                  lists={lists}
                  onAssignToList={handleAssignToList}
                  onMarkAsRead={handleMarkAsRead}
                  onUpdateBookRating={handleUpdateBookRating}
                />
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
