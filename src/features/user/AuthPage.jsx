import { useState } from 'react'
import { loginUser, registerUser } from './authService'
import './user.css'

const initialForm = { name: '', email: '', password: '', confirmPassword: '' }

function getFirebaseMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  }

  return messages[error.code] || 'Something went wrong. Please try again.'
}

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === 'register'

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setForm(initialForm)
    setError('')
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (isRegistering && !form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    if (isRegistering && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const user = isRegistering
        ? await registerUser(form)
        : await loginUser(form.email, form.password)
      onAuthenticated(user)
    } catch (firebaseError) {
      setError(getFirebaseMessage(firebaseError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">SRI LANKA DISASTER RELIEF CONNECT</p>
        <h1>Help should find its way home.</h1>
        <p className="intro-copy">
          Sign in to report a disaster, request relief, and keep track of every update in one place.
        </p>
        <div className="intro-points" aria-label="User features">
          <span>01 <strong>Report safely</strong></span>
          <span>02 <strong>Request support</strong></span>
          <span>03 <strong>Follow progress</strong></span>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-heading">
          <p className="panel-kicker">REGISTERED USER</p>
          <h2 id="auth-title">{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
          <p>{isRegistering ? 'Join the community response network.' : 'Access your personal relief dashboard.'}</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" role="tab" aria-selected={!isRegistering} className={!isRegistering ? 'active' : ''} onClick={() => switchMode('login')}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={isRegistering} className={isRegistering ? 'active' : ''} onClick={() => switchMode('register')}>
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegistering && (
            <label>
              Full name
              <input name="name" type="text" autoComplete="name" value={form.name} onChange={updateField} placeholder="e.g. Kasun Perera" />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} value={form.password} onChange={updateField} placeholder="At least 6 characters" />
          </label>
          {isRegistering && (
            <label>
              Confirm password
              <input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={updateField} placeholder="Enter password again" />
            </label>
          )}

          {error && <p className="form-message error" role="alert">{error}</p>}
          {notice && <p className="form-message success" role="status">{notice}</p>}
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footnote">
          {isRegistering ? 'Already registered?' : 'New to Relief Connect?'}{' '}
          <button type="button" onClick={() => switchMode(isRegistering ? 'login' : 'register')}>
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </section>
    </main>
  )
}
