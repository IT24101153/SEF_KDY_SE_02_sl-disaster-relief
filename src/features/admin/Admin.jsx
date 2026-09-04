import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../../firebase.js'
import DisasterWarnings from './DisasterWarnings.jsx'
import WeatherForecasts from './WeatherForecasts.jsx'
import './admin.css'

function AdminDashboard() {
  const [user, setUser] = useState(undefined)
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) {
        navigate('/admin/login', { replace: true })
      }
    })
    return unsubscribe
  }, [navigate])

  useEffect(() => {
    if (!user) return
    const pendingReports = query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
    )
    const unsubscribe = onSnapshot(pendingReports, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      docs.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
      )
      setReports(docs)
      setReportsLoading(false)
    })
    return unsubscribe
  }, [user])

  async function handleReview(reportId, status) {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      reviewedBy: user.uid,
    })
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/admin/login')
  }

  if (!user) return null

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Disaster Admin Dashboard</h1>
        <button type="button" onClick={handleLogout}>
          Log Out
        </button>
      </header>

      <section className="panel">
        <h2>Pending Reports</h2>
        {reportsLoading ? (
          <p className="placeholder">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="placeholder">No pending reports.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report) => (
              <li key={report.id} className="report-card">
                <div className="report-meta">
                  <strong>{report.district}</strong>
                  <span className="badge">{report.type}</span>
                </div>
                <p>{report.description}</p>
                <div className="report-actions">
                  <button
                    type="button"
                    className="approve"
                    onClick={() => handleReview(report.id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="reject"
                    onClick={() => handleReview(report.id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DisasterWarnings />
      <WeatherForecasts />
    </div>
  )
}

export default AdminDashboard
