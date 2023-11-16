// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBORIEalmm7wDneI5KtoCs4h2oEQSLpIEs",
  authDomain: "bookshelved-c5988.firebaseapp.com",
  projectId: "bookshelved-c5988",
  storageBucket: "bookshelved-c5988.appspot.com",
  messagingSenderId: "484269649149",
  appId: "1:484269649149:web:c8733df0a811c3dc9be294"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
