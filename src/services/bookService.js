// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, addDoc, doc, where, deleteDoc, Timestamp } from 'firebase/firestore'

// Add a read book to the firestore
export async function logBook(user, book) {
  const userId = user.uid

  // Fields to be stored for each book in firebase
  let bookData = {
    title: book.volumeInfo.title,
    volumeId: book.id,
    thumbnail:
      book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail ? book.volumeInfo.imageLinks.thumbnail : '',
    authors: book.volumeInfo.authors ? book.volumeInfo.authors : '',
    publishedDate: book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate : '',
    description: book.volumeInfo.description ? book.volumeInfo.description : '',
    pageCount: book.volumeInfo.pageCount ? book.volumeInfo.pageCount : '',
    averageRating: book.volumeInfo.averageRating ? book.volumeInfo.averageRating : '',
    categories: book.volumeInfo.categories ? book.volumeInfo.categories : '',
    dateLogged: Timestamp.now()
  }

  const userRef = doc(db, 'users', userId)
  const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')

  try {
    // Check if book has already been logged
    const existingBookQuery = query(loggedBooksCollectionRef, where('volumeId', '==', book.id))
    const existingBookSnapshot = await getDocs(existingBookQuery)

    // If book has already been logged, won't log it again
    if (!existingBookSnapshot.empty) {
      return
    }

    const loggedBookRef = await addDoc(loggedBooksCollectionRef, bookData)
    return { userId, bookId: loggedBookRef.id, ...bookData }
  } catch (error) {
    console.error('Error logging book:', error)
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
  // Fetch all the books in the user's read books log
  const userRef = doc(db, 'users', userId)
  const snapshot = await getDocs(collection(userRef, 'loggedBooks'))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
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
        return b.averageRating - a.averageRating
      case 'lowestToHighestRating':
        return a.averageRating - b.averageRating
      case 'oldestToNewestLogged':
        return a.dateLogged - b.dateLogged
      case 'newestToOldestLogged':
        return b.dateLogged - a.dateLogged
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
