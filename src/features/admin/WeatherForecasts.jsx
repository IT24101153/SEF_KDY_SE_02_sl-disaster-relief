import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase.js'
import { SRI_LANKA_DISTRICTS } from '../../lib/districts.js'

const CONDITIONS = ['Sunny', 'Cloudy', 'Showers', 'Heavy Rain', 'Thunderstorms']

const emptyForm = {
  district: SRI_LANKA_DISTRICTS[0].name,
  condition: CONDITIONS[0],
  forecast: '',
}

function WeatherForecasts() {
  const [forecasts, setForecasts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'weatherForecasts'),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        docs.sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
        )
        setForecasts(docs)
      },
    )
    return unsubscribe
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.forecast.trim()) return

    setSaving(true)
    try {
      await addDoc(collection(db, 'weatherForecasts'), {
        ...form,
        createdAt: serverTimestamp(),
      })
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'weatherForecasts', id))
  }

  return (
    <div className="panel">
      <h2>Weather Forecasts</h2>
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
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Forecast details"
          value={form.forecast}
          onChange={(e) => setForm({ ...form, forecast: e.target.value })}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add Forecast'}
        </button>
      </form>

      {forecasts.length === 0 ? (
        <p className="placeholder">No weather forecasts yet.</p>
      ) : (
        <ul className="report-list">
          {forecasts.map((f) => (
            <li key={f.id} className="report-card">
              <div className="report-meta">
                <strong>{f.district}</strong>
                <span className="badge">{f.condition}</span>
              </div>
              <p>{f.forecast}</p>
              <div className="report-actions">
                <button
                  type="button"
                  className="reject"
                  onClick={() => handleDelete(f.id)}
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

export default WeatherForecasts
