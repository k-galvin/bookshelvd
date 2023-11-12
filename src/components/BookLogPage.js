import { useState, useEffect } from 'react'
import { fetchAllBooks } from '../services/bookService'
import { SignIn, SignOut } from '../services/authService'

export default function BookLogPage({ user }) {
  // Fetch all books in the log

  return (
    <div>
      {/* Display all the books in the log */}
      {!user ? <SignIn /> : <SignOut />}
    </div>
  )
}
