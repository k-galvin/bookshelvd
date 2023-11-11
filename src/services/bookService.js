// This service completely hides the data store from the rest of the app.

import { db } from '../firebaseConfig'
import { collection, query, getDocs, addDoc, limit } from 'firebase/firestore'

// Add a read book to the firestore
export async function addBook({ id }) {
  // Store book volume id in a collection specific to the user
}

// Fetch books from firebase
export async function fetchAllBooks() {
  // Fetch all the books in the user's read books log
  const snapshot = await getDocs(query(collection(db, 'loggedBooks')))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}
