import './App.css'
import { SignIn, SignOut, useAuthentication } from '../services/authService'
import BookSearch from './BookSearch'
import BookLog from './BookLog'

function App() {
  const user = useAuthentication()

  return (
    <div>
      <BookSearch user={user} />
      {/* <BookLog /> */}
      {!user ? <SignIn /> : <SignOut />}
    </div>
  )
}

export default App
