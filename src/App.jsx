import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import AuthPage from './features/user/AuthPage'
import './App.css'

function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  if (user === undefined) {
    return <div className="app-loading">Loading your account...</div>
  }

  if (!user) {
    return <AuthPage onAuthenticated={setUser} />
  }

  return (
    <main className="signed-in-placeholder">
      <p className="eyebrow">REGISTERED USER</p>
      <h1>Welcome, {user.displayName || user.email}</h1>
      <p>Your account is ready. Report a disaster or request relief from your user dashboard.</p>
    </main>
  )
}

export default App
