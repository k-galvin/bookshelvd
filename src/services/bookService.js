// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, getDoc, addDoc, doc, where, deleteDoc, updateDoc, Timestamp, collectionGroup } from 'firebase/firestore'

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
    originalYear: logDetails.originalYear || book.originalYear || null,
    description: book.volumeInfo?.description || book.description || '',
    pageCount: book.volumeInfo?.pageCount || book.pageCount || '',
    averageRating: book.volumeInfo?.averageRating || book.averageRating || '',
    categories: book.volumeInfo?.categories || book.categories || [],
    
    // User specific data
    userRating: logDetails.rating || 0,
    userReview: logDetails.review || '',
    dateRead: logDetails.dateRead === null ? null : (logDetails.dateRead || Timestamp.now()),
    isLiked: logDetails.isLiked || false,
    readCount: logDetails.readCount || 1,
    createdAt: Timestamp.now()
  }

  const userRef = doc(db, 'users', userId)
  const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')

  try {


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

// TBR functions
export async function addToTBR(user, book) {
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
    console.error('Error adding to TBR:', error)
    throw error
  }
}

export async function removeFromTBR(user, volumeId) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const watchlistRef = collection(userRef, 'watchlist')
    const q = query(watchlistRef, where('volumeId', '==', volumeId))
    const snapshot = await getDocs(q)
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(watchlistRef, d.id)))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error removing from TBR:', error)
    throw error
  }
}

export async function fetchTBR(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const snapshot = await getDocs(collection(userRef, 'watchlist'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching TBR:', error)
    throw error
  }
}

export function getSortedBooks(loggedBooks, sortOption) {
  if (!loggedBooks) return null

  const compareFunction = (a, b) => {
    // Helper to get raw numeric/time value for comparison
    const getVal = (obj, field) => {
      if (field === 'releaseYear') {
        // Prioritize originalYear, fallback to publishedDate
        const yearValue = obj.originalYear || obj.publishedDate;
        if (!yearValue) return 0;
        const year = yearValue.toString().split('-')[0];
        return parseInt(year, 10) || 0;
      }

      const val = obj[field];
      if (val === undefined || val === null || val === '') return 0;
      
      // Precise timestamp comparison using milliseconds
      if (field === 'dateRead' || field === 'createdAt') {
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (val.seconds !== undefined) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000;
        return new Date(val).getTime();
      }
      
      if (field === 'userRating') return val || 0;
      if (field === 'pageCount') return val || 0;
      return val;
    };

    switch (sortOption) {
      case 'oldestToNewestRelease':
        return getVal(a, 'releaseYear') - getVal(b, 'releaseYear')
      case 'newestToOldestRelease':
        return getVal(b, 'releaseYear') - getVal(a, 'releaseYear')
      case 'highestToLowestRating':
        return getVal(b, 'userRating') - getVal(a, 'userRating')
      case 'lowestToHighestRating':
        return getVal(a, 'userRating') - getVal(b, 'userRating')
      case 'oldestToNewestLogged': {
        const timeA = getVal(a, 'dateRead') || getVal(a, 'createdAt');
        const timeB = getVal(b, 'dateRead') || getVal(b, 'createdAt');
        // If they were read on same day, use creation time as tie-breaker
        if (timeA === timeB) return getVal(a, 'createdAt') - getVal(b, 'createdAt');
        return timeA - timeB;
      }
      case 'newestToOldestLogged': {
        const timeA = getVal(a, 'dateRead') || getVal(a, 'createdAt');
        const timeB = getVal(b, 'dateRead') || getVal(b, 'createdAt');
        // If they were read on same day, use creation time as tie-breaker (newest entry first)
        if (timeA === timeB) return getVal(b, 'createdAt') - getVal(a, 'createdAt');
        return timeB - timeA;
      }
      case 'shortestToLongestLength':
        return getVal(a, 'pageCount') - getVal(b, 'pageCount')
      case 'longestToShortestLength':
        return getVal(b, 'pageCount') - getVal(a, 'pageCount')
      default:
        return 0
    }
  }

  return [...loggedBooks].sort(compareFunction)
}

// --- Favorites Management ---
export async function fetchFavorites(userId) {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
      return userDocSnap.data().favorites || []
    }
    return []
  } catch (error) {
    console.error('Error fetching favorites:', error)
    throw error
  }
}

export async function saveFavorites(userId, favoritesArray) {
  try {
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, { favorites: favoritesArray })
  } catch (error) {
    console.error('Error saving favorites:', error)
    throw error
  }
}

// --- Custom Lists Management ---
export async function createList(user, name, description, books = [], isPublic = true) {
  try {
    const userRef = doc(db, 'users', user.uid)
    const listsCollectionRef = collection(userRef, 'lists')
    const listDoc = {
      name,
      description,
      books,
      isPublic,
      createdAt: Timestamp.now()
    }
    const docRef = await addDoc(listsCollectionRef, listDoc)
    return { id: docRef.id, ...listDoc }
  } catch (error) {
    console.error('Error creating list:', error)
    throw error
  }
}

export async function fetchLists(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const snapshot = await getDocs(collection(userRef, 'lists'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching lists:', error)
    throw error
  }
}

export async function fetchListById(userId, listId) {
  try {
    const userRef = doc(db, 'users', userId)
    const listDocRef = doc(userRef, 'lists', listId)
    const snap = await getDoc(listDocRef)
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching list by id:', error)
    throw error
  }
}

export async function updateList(userId, listId, updates) {
  try {
    const userRef = doc(db, 'users', userId)
    const listDocRef = doc(userRef, 'lists', listId)
    await updateDoc(listDocRef, updates)
  } catch (error) {
    console.error('Error updating list:', error)
    throw error
  }
}

export async function deleteList(userId, listId) {
  try {
    const userRef = doc(db, 'users', userId)
    const listDocRef = doc(userRef, 'lists', listId)
    await deleteDoc(listDocRef)
  } catch (error) {
    console.error('Error deleting list:', error)
    throw error
  }
}

export async function addBookToList(userId, listId, book) {
  try {
    const list = await fetchListById(userId, listId)
    if (!list) return []
    const currentBooks = list.books || []
    if (currentBooks.some(b => b.volumeId === book.volumeId)) return currentBooks
    const updatedBooks = [...currentBooks, book]
    await updateList(userId, listId, { books: updatedBooks })
    return updatedBooks
  } catch (error) {
    console.error('Error adding book to list:', error)
    throw error
  }
}

export async function removeBookFromList(userId, listId, volumeId) {
  try {
    const list = await fetchListById(userId, listId)
    if (!list) return []
    const currentBooks = list.books || []
    const updatedBooks = currentBooks.filter(b => b.volumeId !== volumeId)
    await updateList(userId, listId, { books: updatedBooks })
    return updatedBooks
  } catch (error) {
    console.error('Error removing book from list:', error)
    throw error
  }
}

export async function fetchAllPublicLists() {
  try {
    const snapshot = await getDocs(collectionGroup(db, 'lists'))
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        userId: doc.ref.parent.parent?.id,
        ...doc.data()
      }))
      .filter(list => list.isPublic !== false)
  } catch (error) {
    console.error('Error fetching all public lists:', error)
    throw error
  }
}
