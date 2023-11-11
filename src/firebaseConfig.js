// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBw7ypyzXk6NecYwQOXWuEcEk7pxaMfpEw',
  authDomain: 'shelved-b3133.firebaseapp.com',
  projectId: 'shelved-b3133',
  storageBucket: 'shelved-b3133.appspot.com',
  messagingSenderId: '941669756338',
  appId: '1:941669756338:web:570b066d214a7e27fb48ab'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
