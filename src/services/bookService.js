// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, addDoc, doc, where, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore'

// Add a read book to the firestore
export async function logBook(user, book, logDetails = {}) {
  const userId = user.uid

  // Fields to be stored for each book in firebase
  let bookData = {
    title: book.volumeInfo?.title || book.title,
    volumeId: book.id || book.volumeId,
    thumbnail:
      book.volumeInfo?.imageLinks?.thumbnail || book.thumbnail || '',
    authors: book.volumeInfo?.authors || book.authors || [],
    publishedDate: book.volumeInfo?.publishedDate || book.publishedDate || '',
    description: book.volumeInfo?.description || book.description || '',
    pageCount: book.volumeInfo?.pageCount || book.pageCount || '',
    averageRating: book.volumeInfo?.averageRating || book.averageRating || '',
    categories: book.volumeInfo?.categories || book.categories || [],
    
    // User specific data
    userRating: logDetails.rating || 0,
    userReview: logDetails.review || '',
    dateRead: logDetails.dateRead || Timestamp.now(),
    isLiked: logDetails.isLiked || false,
    createdAt: Timestamp.now()
  }

  const userRef = doc(db, 'users', userId)
  const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')

  try {
    // Check if book has already been logged
    const existingBookQuery = query(loggedBooksCollectionRef, where('volumeId', '==', bookData.volumeId))
    const existingBookSnapshot = await getDocs(existingBookQuery)

    if (!existingBookSnapshot.empty) {
      // For simplicity, we just return if already logged
      return
    }

    const loggedBookRef = await addDoc(loggedBooksCollectionRef, bookData)
    return { id: loggedBookRef.id, ...bookData }
  } catch (error) {
    console.error('Error logging book:', error.message)
    throw error
  }
}

// Update an existing log
export async function updateLoggedBook(user, logId, updates) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const loggedBookRef = doc(userRef, 'loggedBooks', logId)
    await updateDoc(loggedBookRef, updates)
  } catch (error) {
    console.error('Error updating book log:', error.message)
    throw error
  }
}

// Remove logged book from firebase
export async function removeLoggedBook(user, id) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')
    const loggedBookRef = doc(loggedBooksCollectionRef, id)
    await deleteDoc(loggedBookRef)
  } catch (error) {
    throw error
  }
}

// Fetch logged books from firebase
export async function fetchLoggedBooks(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const snapshot = await getDocs(collection(userRef, 'loggedBooks'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    throw error
  }
}

// Watchlist functions
export async function addToWatchlist(user, book) {
  const userId = user.uid
  const bookData = {
    title: book.volumeInfo?.title || book.title,
    volumeId: book.id || book.volumeId,
    thumbnail: book.volumeInfo?.imageLinks?.thumbnail || book.thumbnail || '',
    authors: book.volumeInfo?.authors || book.authors || [],
    createdAt: Timestamp.now()
  }

  const userRef = doc(db, 'users', userId)
  const watchlistRef = collection(userRef, 'watchlist')

  try {
    const existingQuery = query(watchlistRef, where('volumeId', '==', bookData.volumeId))
    const snapshot = await getDocs(existingQuery)
    if (!snapshot.empty) return

    await addDoc(watchlistRef, bookData)
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    throw error
  }
}

export async function removeFromWatchlist(user, volumeId) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const watchlistRef = collection(userRef, 'watchlist')
    const q = query(watchlistRef, where('volumeId', '==', volumeId))
    const snapshot = await getDocs(q)
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(watchlistRef, d.id)))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    throw error
  }
}

export async function fetchWatchlist(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const snapshot = await getDocs(collection(userRef, 'watchlist'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    throw error
  }
}

export function getSortedBooks(loggedBooks, sortOption) {
  if (!loggedBooks) return null

  const compareFunction = (a, b) => {
    switch (sortOption) {
      case 'oldestToNewestRelease':
        return new Date(a.publishedDate) - new Date(b.publishedDate)
      case 'newestToOldestRelease':
        return new Date(b.publishedDate) - new Date(a.publishedDate)
      case 'highestToLowestRating':
        return (b.userRating || b.averageRating) - (a.userRating || a.averageRating)
      case 'lowestToHighestRating':
        return (a.userRating || a.averageRating) - (b.userRating || b.averageRating)
      case 'oldestToNewestLogged':
        return (a.dateRead?.seconds || a.createdAt?.seconds) - (b.dateRead?.seconds || b.createdAt?.seconds)
      case 'newestToOldestLogged':
        return (b.dateRead?.seconds || b.createdAt?.seconds) - (a.dateRead?.seconds || a.createdAt?.seconds)
      case 'shortestToLongestLength':
        return a.pageCount - b.pageCount
      case 'longestToShortestLength':
        return b.pageCount - a.pageCount
      default:
        return 0
    }
  }

  return [...loggedBooks].sort(compareFunction)
}
