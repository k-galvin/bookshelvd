import { useState, useEffect } from 'react'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { collection, doc, setDoc, getDoc } from 'firebase/firestore'

export function SignIn() {
  return (
    <button className="user-button" onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>
      SIGN IN
    </button>
  )
}

export function SignOut() {
  const [isDropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = () => {
    signOut(auth)
    setDropdownOpen(false) // Close the dropdown after signing out
  }

  return (
    <div>
      <div onClick={() => setDropdownOpen(!isDropdownOpen)}>
        <div className="username-container">
          <div className="username">{auth.currentUser.displayName}</div>
          <div class="material-symbols-outlined">expand_more</div>
        </div>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <button className="user-button" onClick={handleSignOut}>
              SIGN OUT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function useAuthentication() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    return auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user)
        storeUserData(user)
      } else {
        setUser(null)
      }
    })
  }, [])
  return user
}

// Function that creates a new user doc in the firestore if the user
// hasn't logged in before
const storeUserData = async user => {
  try {
    const usersCollection = collection(db, 'users')
    const userDocRef = doc(usersCollection, user.uid)

    const userDoc = await getDoc(userDocRef)

    // Only add new doc if user is not already in firestore
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        displayName: user.displayName,
        username: user.email
      })
    }
  } catch (error) {
    console.error('Error storing user data:', error)
  }
}
