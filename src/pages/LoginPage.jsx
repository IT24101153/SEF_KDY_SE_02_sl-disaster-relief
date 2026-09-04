import { Navigate } from 'react-router-dom'
import AuthPage from '../features/user/AuthPage.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { HOME_BY_ROLE } from '../lib/collections.js'

// AuthPage handles sign in and registration; the redirect is driven by the
// auth context so it works for both, and for an already-signed-in visitor.
export default function LoginPage() {
  const { user, role, loading } = useAuth()

  if (loading) return <p className="route-loading">Loading…</p>
  if (user) return <Navigate to={HOME_BY_ROLE[role] ?? '/'} replace />

  return <AuthPage onAuthenticated={() => {}} />
}
