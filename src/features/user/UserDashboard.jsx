import { useEffect, useState } from 'react'
import { logoutUser } from './authService'
import {
  createDisasterReport,
  createReliefRequest,
  getUserReliefRequests,
  getUserReports,
} from './userService'
import './user.css'

const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kegalle', 'Nuwara Eliya', 'Badulla', 'Ratnapura']
const emptyReport = { district: '', type: 'flood', severity: 'medium', description: '' }
const emptyRelief = { district: '', needType: 'food', peopleCount: '', description: '' }

function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Just now'
  return timestamp.toDate().toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${status}`}>{status}</span>
}

function SubmissionList({ items, kind }) {
  if (!items.length) {
    return <div className="empty-state"><strong>No {kind} yet</strong><span>Your submitted items will appear here.</span></div>
  }

  return (
    <div className="submission-list">
      {items.map((item) => (
        <article className="submission-card" key={item.id}>
          <div className="submission-topline">
            <span>{item.district}</span>
            <StatusBadge status={item.status} />
          </div>
          <h3>{kind === 'reports' ? `${item.type} report` : `${item.needType} support request`}</h3>
          <p>{item.description}</p>
          <small>Submitted {formatDate(item.createdAt)}</small>
          {item.assignedTeam && <div className="schedule-note"><strong>{item.assignedTeam}</strong><span>Scheduled for {item.scheduledTime}</span></div>}
        </article>
      ))}
    </div>
  )
}

export default function UserDashboard({ user }) {
  const [activeView, setActiveView] = useState('overview')
  const [reports, setReports] = useState([])
  const [reliefRequests, setReliefRequests] = useState([])
  const [reportForm, setReportForm] = useState(emptyReport)
  const [reliefForm, setReliefForm] = useState(emptyRelief)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadSubmissions() {
    setIsLoading(true)
    try {
      const [userReports, userRequests] = await Promise.all([
        getUserReports(user.uid),
        getUserReliefRequests(user.uid),
      ])
      setReports(userReports)
      setReliefRequests(userRequests)
    } catch {
      setMessage({ type: 'error', text: 'We could not load your submissions. Please refresh and try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [user.uid])

  function updateForm(setter, event) {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
  }

  async function submitReport(event) {
    event.preventDefault()
    if (!reportForm.district || !reportForm.description.trim()) {
      setMessage({ type: 'error', text: 'Please select a district and describe what is happening.' })
      return
    }
    setIsSubmitting(true)
    try {
      await createDisasterReport(user.uid, reportForm)
      setReportForm(emptyReport)
      setMessage({ type: 'success', text: 'Your report was submitted for review.' })
      await loadSubmissions()
      setActiveView('reports')
    } catch {
      setMessage({ type: 'error', text: 'Your report could not be submitted. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitReliefRequest(event) {
    event.preventDefault()
    if (!reliefForm.district || !reliefForm.peopleCount || Number(reliefForm.peopleCount) < 1 || !reliefForm.description.trim()) {
      setMessage({ type: 'error', text: 'Please complete every field with valid information.' })
      return
    }
    setIsSubmitting(true)
    try {
      await createReliefRequest(user.uid, reliefForm)
      setReliefForm(emptyRelief)
      setMessage({ type: 'success', text: 'Your relief request was sent to the coordination team.' })
      await loadSubmissions()
      setActiveView('requests')
    } catch {
      setMessage({ type: 'error', text: 'Your request could not be submitted. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'there'

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-mark"><span>SL</span><div><strong>Relief Connect</strong><small>Registered user portal</small></div></div>
        <div className="user-menu"><span>{displayName}</span><button type="button" onClick={logoutUser}>Sign out</button></div>
      </header>
      <div className="dashboard-body">
        <aside className="dashboard-nav" aria-label="User dashboard navigation">
          <p className="nav-label">YOUR SPACE</p>
          <button className={activeView === 'overview' ? 'selected' : ''} type="button" onClick={() => setActiveView('overview')}>Overview</button>
          <button className={activeView === 'report' ? 'selected' : ''} type="button" onClick={() => setActiveView('report')}>Report a disaster</button>
          <button className={activeView === 'relief' ? 'selected' : ''} type="button" onClick={() => setActiveView('relief')}>Request relief</button>
          <p className="nav-label nav-label-spaced">TRACKING</p>
          <button className={activeView === 'reports' ? 'selected' : ''} type="button" onClick={() => setActiveView('reports')}>My reports <em>{reports.length}</em></button>
          <button className={activeView === 'requests' ? 'selected' : ''} type="button" onClick={() => setActiveView('requests')}>My relief requests <em>{reliefRequests.length}</em></button>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-title"><p className="panel-kicker">PERSONAL DASHBOARD</p><h1>{activeView === 'overview' ? `Good to see you, ${displayName}.` : activeView === 'report' ? 'Report a disaster' : activeView === 'relief' ? 'Request relief' : activeView === 'reports' ? 'My disaster reports' : 'My relief requests'}</h1><p>{activeView === 'overview' ? 'Keep your community informed and stay close to the support you need.' : activeView === 'report' ? 'Your report will be reviewed by the Disaster Admin team.' : activeView === 'relief' ? 'Tell the relief team what your household or community needs.' : 'Follow the progress of your submissions here.'}</p></div>
          {message.text && <div className={`dashboard-message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}<button type="button" aria-label="Dismiss message" onClick={() => setMessage({ type: '', text: '' })}>×</button></div>}

          {activeView === 'overview' && <section className="overview-grid"><button type="button" className="action-tile report-tile" onClick={() => setActiveView('report')}><span>01</span><strong>Report a disaster</strong><small>Share what is happening in your area.</small></button><button type="button" className="action-tile relief-tile" onClick={() => setActiveView('relief')}><span>02</span><strong>Request relief</strong><small>Ask for essential support for your people.</small></button><div className="stats-strip"><div><strong>{reports.length}</strong><span>Disaster reports</span></div><div><strong>{reliefRequests.length}</strong><span>Relief requests</span></div><div><strong>{reliefRequests.filter((item) => item.status === 'scheduled').length}</strong><span>Scheduled</span></div></div></section>}

          {activeView === 'report' && <form className="dashboard-form" onSubmit={submitReport}><label>District<select name="district" value={reportForm.district} onChange={(event) => updateForm(setReportForm, event)}><option value="">Choose district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label><div className="form-row"><label>Disaster type<select name="type" value={reportForm.type} onChange={(event) => updateForm(setReportForm, event)}><option value="flood">Flood</option><option value="landslide">Landslide</option><option value="other">Other</option></select></label><label>Severity<select name="severity" value={reportForm.severity} onChange={(event) => updateForm(setReportForm, event)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label></div><label>What is happening?<textarea name="description" value={reportForm.description} onChange={(event) => updateForm(setReportForm, event)} placeholder="Describe the affected area, roads, homes, or immediate danger..." rows="6" /></label><button className="dashboard-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Submit report'}</button></form>}

          {activeView === 'relief' && <form className="dashboard-form" onSubmit={submitReliefRequest}><label>District<select name="district" value={reliefForm.district} onChange={(event) => updateForm(setReliefForm, event)}><option value="">Choose district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label><div className="form-row"><label>What do you need?<select name="needType" value={reliefForm.needType} onChange={(event) => updateForm(setReliefForm, event)}><option value="food">Food and water</option><option value="medicine">Medicine</option><option value="shelter">Shelter</option><option value="rescue">Rescue support</option><option value="other">Other</option></select></label><label>People needing help<input name="peopleCount" type="number" min="1" value={reliefForm.peopleCount} onChange={(event) => updateForm(setReliefForm, event)} placeholder="e.g. 4" /></label></div><label>Tell us more<textarea name="description" value={reliefForm.description} onChange={(event) => updateForm(setReliefForm, event)} placeholder="Share any details that will help the team respond..." rows="6" /></label><button className="dashboard-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send relief request'}</button></form>}

          {activeView === 'reports' && (isLoading ? <p className="loading-copy">Loading your reports...</p> : <SubmissionList items={reports} kind="reports" />)}
          {activeView === 'requests' && (isLoading ? <p className="loading-copy">Loading your relief requests...</p> : <SubmissionList items={reliefRequests} kind="requests" />)}
        </main>
      </div>
    </div>
  )
}
