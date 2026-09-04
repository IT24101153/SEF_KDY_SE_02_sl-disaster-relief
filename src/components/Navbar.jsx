import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import { ROLES } from '../lib/collections.js'
import './Navbar.css'

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/disaster-areas', label: 'Disaster Areas' },
  { to: '/news', label: 'News' },
]

const ROLE_LINKS = {
  [ROLES.USER]: [{ to: '/dashboard', label: 'My Dashboard' }],
  [ROLES.DISASTER_ADMIN]: [{ to: '/admin', label: 'Admin Console' }],
  [ROLES.NEWS_MANAGER]: [{ to: '/news-manager', label: 'News Manager' }],
  [ROLES.RELIEF_MANAGER]: [{ to: '/relief-manager', label: 'Relief Manager' }],
}

export default function Navbar() {
  const { user, role } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const links = [...PUBLIC_LINKS, ...(ROLE_LINKS[role] ?? [])]

  async function handleSignOut() {
    setOpen(false)
    await signOut(auth)
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
        Sri Lanka Disaster &amp; Relief Connect
      </Link>

      <button
        type="button"
        className="navbar-toggle"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`navbar-links${open ? ' open' : ''}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}

        {user ? (
          <button type="button" className="navbar-cta" onClick={handleSignOut}>
            Sign out
          </button>
        ) : (
          <Link
            to="/login"
            className="navbar-cta"
            onClick={() => setOpen(false)}
          >
            Login / Register
          </Link>
        )}
      </nav>
    </header>
  )
}
