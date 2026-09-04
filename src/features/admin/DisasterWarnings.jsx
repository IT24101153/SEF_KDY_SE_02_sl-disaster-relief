import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase.js'
import {
  DISASTER_TYPES,
  RISK_LEVELS,
  SRI_LANKA_DISTRICTS,
} from '../../lib/districts.js'

const emptyForm = {
  district: SRI_LANKA_DISTRICTS[0].name,
  type: DISASTER_TYPES[0],
  riskLevel: RISK_LEVELS[0],
  description: '',
}

function DisasterWarnings() {
  const [warnings, setWarnings] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'disasterAreas'),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        docs.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        )
        setWarnings(docs)
      },
    )
    return unsubscribe
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim()) return

    setSaving(true)
    try {
      await addDoc(collection(db, 'disasterAreas'), {
        ...form,
        status: 'active',
        source: 'admin',
        createdAt: serverTimestamp(),
      })
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(warning) {
    await updateDoc(doc(db, 'disasterAreas', warning.id), {
      status: warning.status === 'active' ? 'resolved' : 'active',
    })
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'disasterAreas', id))
  }

  return (
    <div className="panel">
      <h2>Disaster Warnings</h2>
      <form className="inline-form" onSubmit={handleSubmit}>
        <select
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        >
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {DISASTER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={form.riskLevel}
          onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}
        >
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>
              {r} risk
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add Warning'}
        </button>
      </form>

      {warnings.length === 0 ? (
        <p className="placeholder">No disaster warnings yet.</p>
      ) : (
        <ul className="report-list">
          {warnings.map((w) => (
            <li key={w.id} className="report-card">
              <div className="report-meta">
                <strong>{w.district}</strong>
                <span className="badge">{w.type}</span>
                <span className={`badge risk-${w.riskLevel}`}>
                  {w.riskLevel} risk
                </span>
                <span className={`badge status-${w.status}`}>
                  {w.status}
                </span>
              </div>
              <p>{w.description}</p>
              <div className="report-actions">
                <button type="button" onClick={() => toggleStatus(w)}>
                  {w.status === 'active' ? 'Mark Resolved' : 'Reactivate'}
                </button>
                <button
                  type="button"
                  className="reject"
                  onClick={() => handleDelete(w.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DisasterWarnings
