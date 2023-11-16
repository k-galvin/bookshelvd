// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, addDoc, doc, where, deleteDoc } from 'firebase/firestore'

// Add a read book to the firestore
export async function logBook(user, book) {
  const userId = user.uid

  // Fields to be stored for each book in firebase
  let bookData = {
    title: book.volumeInfo.title,
    volumeId: book.id,
    thumbnail: book.volumeInfo.imageLinks.thumbnail ? book.volumeInfo.imageLinks.thumbnail : null,
    authors: book.volumeInfo.authors ? book.volumeInfo.authors : '',
    publishedDate: book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate : '',
    description: book.volumeInfo.description ? book.volumeInfo.description : '',
    pageCount: book.volumeInfo.pageCount ? book.volumeInfo.pageCount : '',
    averageRating: book.volumeInfo.averageRating ? book.volumeInfo.averageRating : '',
    categories: book.volumeInfo.categories ? book.volumeInfo.categories : ''
  }

  const userRef = doc(db, 'users', userId)
  const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')

  // Check if book has already been logged
  const existingBookQuery = query(loggedBooksCollectionRef, where('volumeId', '==', book.id))
  const existingBookSnapshot = await getDocs(existingBookQuery)

  // If book has already been logged, won't log it again
  if (!existingBookSnapshot.empty) {
    return
  }

  const loggedBookRef = await addDoc(loggedBooksCollectionRef, bookData)
  return { userId, bookId: loggedBookRef.id, ...bookData }
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
