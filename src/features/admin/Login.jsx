import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.js'
import './admin.css'

const ERROR_MESSAGES = {
  'auth/invalid-email': 'That email address looks invalid.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network error — check your connection and try again.',
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getDoc(doc(db, 'Users', credentials.user.uid))
      navigate(profile.data()?.role === 'relief_manager' ? '/relief-manager' : '/admin')
    } catch (err) {
      setError(
        ERROR_MESSAGES[err.code] ?? 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-auth">
      <form className="admin-auth-form" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        {error && <p className="form-error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </form>
    </div>
  )
}

export default AdminLogin
