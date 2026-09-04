import { useEffect, useState } from 'react'
import { logoutUser } from './authService'
import {
  createDisasterReport,
  createReliefRequest,
  subscribeToUserReliefRequests,
  subscribeToUserReports,
} from './userService'
import './user.css'

const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kegalle', 'Nuwara Eliya', 'Badulla', 'Ratnapura']
const emptyReport = { district: '', type: 'flood', severity: 'medium', description: '' }
const emptyRelief = { district: '', needType: 'food', peopleCount: '', description: '' }

function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Just now'
  return timestamp.toDate().toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// scheduledTime arrives as a Firestore Timestamp; rendering one straight into
// JSX throws "Objects are not valid as a React child".
function formatScheduledTime(value) {
  if (!value) return 'a time to be confirmed'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function validateReport(form) {
  const errors = {}
  if (!form.district) errors.district = 'Please select the affected district.'
  if (!form.type) errors.type = 'Please choose the type of disaster.'
  if (!form.severity) errors.severity = 'Please choose how severe this is.'
  if (!form.description.trim()) {
    errors.description = 'Please describe what is happening.'
  } else if (form.description.trim().length < 10) {
    errors.description = 'Please add a little more detail — at least 10 characters.'
  }
  return errors
}

function validateRelief(form) {
  const errors = {}
  if (!form.district) errors.district = 'Please select the district that needs help.'
  if (!form.needType) errors.needType = 'Please select the kind of help needed.'
  if (!form.peopleCount) {
    errors.peopleCount = 'Please enter how many people need help.'
  } else if (!Number.isInteger(Number(form.peopleCount)) || Number(form.peopleCount) < 1) {
    errors.peopleCount = 'Enter a whole number of people — at least 1.'
  }
  if (!form.description.trim()) {
    errors.description = 'Please tell the team what you need.'
  } else if (form.description.trim().length < 10) {
    errors.description = 'Please add a little more detail — at least 10 characters.'
  }
  return errors
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
          {item.assignedTeam && <div className="schedule-note"><strong>{item.assignedTeam}</strong><span>Scheduled for {formatScheduledTime(item.scheduledTime)}</span></div>}
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
  const [reportErrors, setReportErrors] = useState({})
  const [reliefErrors, setReliefErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live listeners, so a status change made by an admin lands here without a refresh.
  useEffect(() => {
    let loadedReports = false
    let loadedRequests = false
    const settle = () => {
      if (loadedReports && loadedRequests) setIsLoading(false)
    }

    const unsubReports = subscribeToUserReports(user.uid, (data) => {
      setReports(data)
      loadedReports = true
      settle()
    })
    const unsubRequests = subscribeToUserReliefRequests(user.uid, (data) => {
      setReliefRequests(data)
      loadedRequests = true
      settle()
    })

    return () => {
      unsubReports()
      unsubRequests()
    }
  }, [user.uid])

  function updateForm(setter, errorSetter, event) {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
    errorSetter((current) => ({ ...current, [name]: undefined }))
  }

  async function submitReport(event) {
    event.preventDefault()
    const errors = validateReport(reportForm)
    setReportErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await createDisasterReport(user.uid, reportForm)
      setReportForm(emptyReport)
      setMessage({ type: 'success', text: 'Your report was submitted for review. Track its status under "My reports" below.' })
      setActiveView('reports')
    } catch {
      setMessage({ type: 'error', text: 'Your report could not be submitted. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitReliefRequest(event) {
    event.preventDefault()
    const errors = validateRelief(reliefForm)
    setReliefErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await createReliefRequest(user.uid, reliefForm)
      setReliefForm(emptyRelief)
      setMessage({ type: 'success', text: 'Your relief request was sent. Track it under "My relief requests" below.' })
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

          {activeView === 'report' && (
            <form className="dashboard-form" onSubmit={submitReport} noValidate>
              <label>District
                <select name="district" value={reportForm.district} onChange={(event) => updateForm(setReportForm, setReportErrors, event)}>
                  <option value="">Choose district</option>
                  {districts.map((district) => <option key={district}>{district}</option>)}
                </select>
              </label>
              {reportErrors.district && <span className="field-error">{reportErrors.district}</span>}
              <div className="form-row">
                <label>Disaster type
                  <select name="type" value={reportForm.type} onChange={(event) => updateForm(setReportForm, setReportErrors, event)}>
                    <option value="flood">Flood</option>
                    <option value="landslide">Landslide</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>Severity
                  <select name="severity" value={reportForm.severity} onChange={(event) => updateForm(setReportForm, setReportErrors, event)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
              </div>
              <label>What is happening?
                <textarea name="description" value={reportForm.description} onChange={(event) => updateForm(setReportForm, setReportErrors, event)} placeholder="Describe the affected area, roads, homes, or immediate danger..." rows="6" />
              </label>
              {reportErrors.description && <span className="field-error">{reportErrors.description}</span>}
              <button className="dashboard-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Submit report'}</button>
            </form>
          )}

          {activeView === 'relief' && (
            <form className="dashboard-form" onSubmit={submitReliefRequest} noValidate>
              <label>District
                <select name="district" value={reliefForm.district} onChange={(event) => updateForm(setReliefForm, setReliefErrors, event)}>
                  <option value="">Choose district</option>
                  {districts.map((district) => <option key={district}>{district}</option>)}
                </select>
              </label>
              {reliefErrors.district && <span className="field-error">{reliefErrors.district}</span>}
              <div className="form-row">
                <label>What do you need?
                  <select name="needType" value={reliefForm.needType} onChange={(event) => updateForm(setReliefForm, setReliefErrors, event)}>
                    <option value="food">Food and water</option>
                    <option value="medicine">Medicine</option>
                    <option value="shelter">Shelter</option>
                    <option value="rescue">Rescue support</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>People needing help
                  <input name="peopleCount" type="number" min="1" value={reliefForm.peopleCount} onChange={(event) => updateForm(setReliefForm, setReliefErrors, event)} placeholder="e.g. 4" />
                </label>
              </div>
              {reliefErrors.peopleCount && <span className="field-error">{reliefErrors.peopleCount}</span>}
              <label>Tell us more
                <textarea name="description" value={reliefForm.description} onChange={(event) => updateForm(setReliefForm, setReliefErrors, event)} placeholder="Share any details that will help the team respond..." rows="6" />
              </label>
              {reliefErrors.description && <span className="field-error">{reliefErrors.description}</span>}
              <button className="dashboard-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send relief request'}</button>
            </form>
          )}

          {activeView === 'reports' && (isLoading ? <p className="loading-copy">Loading your reports...</p> : <SubmissionList items={reports} kind="reports" />)}
          {activeView === 'requests' && (isLoading ? <p className="loading-copy">Loading your relief requests...</p> : <SubmissionList items={reliefRequests} kind="requests" />)}
        </main>
      </div>
    </div>
  )
}
