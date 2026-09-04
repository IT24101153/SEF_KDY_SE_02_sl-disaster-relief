import { useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase.js'
import {
  DISASTER_TYPES,
  RISK_LEVELS,
  SRI_LANKA_DISTRICTS,
} from '../../lib/districts.js'
import { WarningIcon } from './icons.jsx'

const emptyForm = {
  district: SRI_LANKA_DISTRICTS[0].name,
  type: DISASTER_TYPES[0],
  riskLevel: RISK_LEVELS[0],
  description: '',
}

function validate({ description }) {
  const errors = {}
  const trimmed = description.trim()
  if (!trimmed) {
    errors.description = 'A short description is required.'
  } else if (trimmed.length < 10) {
    errors.description = 'Add a little more detail (at least 10 characters).'
  }
  return errors
}

function DisasterWarnings({ warnings }) {
  const [form, setForm] = useState(emptyForm)
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = validate(form)
  const showError = touched && errors.description

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await addDoc(collection(db, 'disasterAreas'), {
        ...form,
        description: form.description.trim(),
        status: 'active',
        source: 'admin',
        createdAt: serverTimestamp(),
      })
      setForm(emptyForm)
      setTouched(false)
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
    <>
      <section className="card">
        <div className="card-head">
          <h2>Issue a warning</h2>
          <p>Published warnings appear instantly on the public map.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="warning-district">District</label>
            <select
              id="warning-district"
              value={form.district}
              onChange={(e) => update('district', e.target.value)}
            >
              {SRI_LANKA_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="warning-type">Type</label>
            <select
              id="warning-type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            >
              {DISASTER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="warning-risk">Risk level</label>
            <select
              id="warning-risk"
              value={form.riskLevel}
              onChange={(e) => update('riskLevel', e.target.value)}
            >
              {RISK_LEVELS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="field field-wide">
            <label htmlFor="warning-description">Description</label>
            <textarea
              id="warning-description"
              rows="3"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              onBlur={() => setTouched(true)}
              className={showError ? 'invalid' : ''}
              placeholder="What is happening, and what should residents do?"
              aria-invalid={Boolean(showError)}
            />
            {showError && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish warning'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>All warnings</h2>
          <p>{warnings.length} total</p>
        </div>

        {warnings.length === 0 ? (
          <div className="empty-state">
            <WarningIcon size={22} />
            <p>No disaster warnings published yet.</p>
          </div>
        ) : (
          <ul className="list">
            {warnings.map((w) => (
              <li key={w.id} className="list-item">
                <div className="list-item-head">
                  <strong>{w.district}</strong>
                  <span className="badge">{w.type}</span>
                  <span className={`badge risk-${w.riskLevel}`}>
                    {w.riskLevel} risk
                  </span>
                  <span className={`badge status-${w.status}`}>{w.status}</span>
                </div>
                <p className="list-item-body">{w.description}</p>
                <div className="list-item-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => toggleStatus(w)}
                  >
                    {w.status === 'active' ? 'Mark resolved' : 'Reactivate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(w.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default DisasterWarnings
