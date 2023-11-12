// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, addDoc, doc, where } from 'firebase/firestore'

// Add a read book to the firestore
export async function logBook(userId, volumeId, title) {
  const bookData = {
    title: title,
    id: volumeId
  }

  const userRef = doc(db, 'users', userId)
  const loggedBooksCollectionRef = collection(userRef, 'loggedBooks')

  // Check if book has already been logged
  const existingBookQuery = query(loggedBooksCollectionRef, where('id', '==', volumeId))
  const existingBookSnapshot = await getDocs(existingBookQuery)

  // If book has already been logged, won't log it again
  if (!existingBookSnapshot.empty) {
    return
  }
  const loggedBookRef = await addDoc(loggedBooksCollectionRef, bookData)
  return { userId, bookId: loggedBookRef.id, ...bookData }
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
