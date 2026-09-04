import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

// Logged out -> /login. Logged in with the wrong role -> /.
export default function ProtectedRoute({ allow, children }) {
  const { user, role, loading } = useAuth()

  if (loading) return <p className="route-loading">Checking access…</p>
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(role)) return <Navigate to="/" replace />

  return children
}
