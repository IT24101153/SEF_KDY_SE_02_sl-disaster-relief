import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../firebase.js'
import ReliefManagerDashboard from './ReliefManagerDashboard.jsx'

// Role gating lives in ProtectedRoute, so this page only renders the console.
export default function ReliefManagerPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="page-shell">
      <div className="page-inner">
        <header className="page-topbar">
          <div>
            <p className="page-kicker">SRI LANKA DISASTER &amp; RELIEF CONNECT</p>
            <h1>Relief Manager</h1>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </header>
        <ReliefManagerDashboard db={db} />
      </div>
    </div>
  )
}
