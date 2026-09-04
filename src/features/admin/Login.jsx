import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
<<<<<<< Updated upstream
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.js'
=======
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase.js'
import { CheckIcon, ShieldIcon } from './icons.jsx'
>>>>>>> Stashed changes
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

const HIGHLIGHTS = [
  'Review and verify community disaster reports',
  'Publish district-level warnings in real time',
  'Share weather forecasts across all 25 districts',
]

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!password) {
    errors.password = 'Password is required.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }
  return errors
}

function AdminLogin() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

<<<<<<< Updated upstream
=======
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCheckingSession(false)
      if (user) navigate('/admin', { replace: true })
    })
  }, [navigate])

  const errors = validate(values)
  const showError = (field) => touched[field] && errors[field]

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }

>>>>>>> Stashed changes
  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError('')

    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
<<<<<<< Updated upstream
      const credentials = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getDoc(doc(db, 'Users', credentials.user.uid))
      navigate(profile.data()?.role === 'relief_manager' ? '/relief-manager' : '/admin')
=======
      await signInWithEmailAndPassword(
        auth,
        values.email.trim(),
        values.password,
      )
      navigate('/admin', { replace: true })
>>>>>>> Stashed changes
    } catch (err) {
      setFormError(
        ERROR_MESSAGES[err.code] ?? 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

<<<<<<< Updated upstream
=======
  if (checkingSession) {
    return <p className="route-loading">Checking session…</p>
  }

>>>>>>> Stashed changes
  return (
    <div className="auth-layout">
      <aside className="auth-brand">
        <div className="auth-brand-mark">
          <ShieldIcon size={20} />
          <span>Disaster &amp; Relief Connect</span>
        </div>

        <div className="auth-brand-body">
          <h1>Coordinating relief across Sri Lanka.</h1>
          <p>
            One console for verifying reports, issuing warnings and keeping
            every district informed.
          </p>
          <ul className="auth-brand-points">
            {HIGHLIGHTS.map((point) => (
              <li key={point}>
                <CheckIcon size={16} />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-footer">Administrator access only</p>
      </aside>

      <main className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-head">
            <h2>Sign in</h2>
            <p>Use your administrator credentials to continue.</p>
          </div>

          {formError && (
            <div className="alert alert-danger" role="alert">
              {formError}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={showError('email') ? 'invalid' : ''}
              placeholder="admin@example.com"
              autoComplete="username"
              disabled={loading}
              aria-invalid={Boolean(showError('email'))}
            />
            {showError('email') && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              className={showError('password') ? 'invalid' : ''}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={Boolean(showError('password'))}
            />
            {showError('password') && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <Link to="/" className="auth-back">
            ← Back to public site
          </Link>
        </form>
      </main>
    </div>
  )
}

export default AdminLogin
