import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.js'
import { DISASTER_AREAS, REPORTS } from '../../lib/collections.js'
import { useCollectionData } from '../../lib/useCollectionData.js'
import PendingReports from './PendingReports.jsx'
import DisasterWarnings from './DisasterWarnings.jsx'
import WeatherForecasts from './WeatherForecasts.jsx'
import {
  LogoutIcon,
  ReportIcon,
  ShieldIcon,
  WarningIcon,
  WeatherIcon,
} from './icons.jsx'
import './admin.css'

const VIEWS = [
  {
    id: 'reports',
    label: 'Pending Reports',
    description: 'Review community-submitted reports before they go public.',
    Icon: ReportIcon,
  },
  {
    id: 'warnings',
    label: 'Disaster Warnings',
    description: 'Publish and manage active warnings by district.',
    Icon: WarningIcon,
  },
  {
    id: 'weather',
    label: 'Weather Forecasts',
    description: 'Share district forecasts with the public feed.',
    Icon: WeatherIcon,
  },
]

function AdminDashboard() {
  const [user, setUser] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (!currentUser) navigate('/admin/login', { replace: true })
    })
  }, [navigate])

  async function handleLogout() {
    await signOut(auth)
    navigate('/admin/login', { replace: true })
  }

  if (!user) return <p className="route-loading">Checking session…</p>

  return <Dashboard user={user} onLogout={handleLogout} />
}

function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('reports')
  const { data: reports, loading: reportsLoading } = useCollectionData(
    REPORTS,
    'status',
    'pending',
  )
  const { data: warnings } = useCollectionData(DISASTER_AREAS)
  const { data: forecasts } = useCollectionData('weatherForecasts')

  const activeWarnings = warnings.filter((w) => w.status === 'active')
  const view = VIEWS.find((v) => v.id === activeView)

  // Approving publishes the report as a public disaster area *and* marks the
  // report reviewed. Rejecting only marks the report — nothing goes public.
  async function handleReview(report, status) {
    if (status === 'approved') {
      await addDoc(collection(db, DISASTER_AREAS), {
        district: report.district,
        type: report.type,
        riskLevel: report.riskLevel ?? 'medium',
        description: report.description,
        status: 'active',
        source: `report:${report.id}`,
        createdAt: serverTimestamp(),
      })
    }

    await updateDoc(doc(db, REPORTS, report.id), {
      status,
      reviewedBy: user.uid,
    })
  }

  const stats = [
    { label: 'Pending reports', value: reports.length },
    { label: 'Active warnings', value: activeWarnings.length },
    { label: 'Published forecasts', value: forecasts.length },
  ]

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">
            <ShieldIcon size={18} />
          </span>
          <span className="sidebar-brand-text">
            <strong>Relief Connect</strong>
            <small>Admin console</small>
          </span>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-item${activeView === id ? ' active' : ''}`}
              onClick={() => setActiveView(id)}
              aria-current={activeView === id ? 'page' : undefined}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">
              {user.email?.[0]?.toUpperCase() ?? 'A'}
            </span>
            <span className="sidebar-user-meta">
              <strong>Administrator</strong>
              <small title={user.email}>{user.email}</small>
            </span>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={onLogout}>
            <LogoutIcon size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="main-topbar">
          <h1>{view.label}</h1>
          <p>{view.description}</p>
        </header>

        <div className="main-content">
          <div className="stat-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {activeView === 'reports' && (
            <PendingReports
              reports={reports}
              loading={reportsLoading}
              onReview={handleReview}
            />
          )}
          {activeView === 'warnings' && <DisasterWarnings warnings={warnings} />}
          {activeView === 'weather' && <WeatherForecasts forecasts={forecasts} />}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
