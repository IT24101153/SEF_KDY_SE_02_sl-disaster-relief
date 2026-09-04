import { useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase.js'
import { WEATHER_FORECASTS } from '../../lib/collections.js'
import { SRI_LANKA_DISTRICTS } from '../../lib/districts.js'
import { WeatherIcon } from './icons.jsx'

const CONDITIONS = ['Sunny', 'Cloudy', 'Showers', 'Heavy Rain', 'Thunderstorms']

const emptyForm = {
  district: SRI_LANKA_DISTRICTS[0].name,
  condition: CONDITIONS[0],
  forecast: '',
}

function validate({ forecast }) {
  const errors = {}
  const trimmed = forecast.trim()
  if (!trimmed) {
    errors.forecast = 'Forecast details are required.'
  } else if (trimmed.length < 10) {
    errors.forecast = 'Add a little more detail (at least 10 characters).'
  }
  return errors
}

function WeatherForecasts({ forecasts }) {
  const [form, setForm] = useState(emptyForm)
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = validate(form)
  const showError = touched && errors.forecast

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await addDoc(collection(db, WEATHER_FORECASTS), {
        ...form,
        forecast: form.forecast.trim(),
        createdAt: serverTimestamp(),
      })
      setForm(emptyForm)
      setTouched(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, WEATHER_FORECASTS, id))
  }

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>Publish a forecast</h2>
          <p>Give residents a clear picture of conditions in their district.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="forecast-district">District</label>
            <select
              id="forecast-district"
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
            <label htmlFor="forecast-condition">Condition</label>
            <select
              id="forecast-condition"
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field field-wide">
            <label htmlFor="forecast-details">Forecast details</label>
            <textarea
              id="forecast-details"
              rows="3"
              value={form.forecast}
              onChange={(e) => update('forecast', e.target.value)}
              onBlur={() => setTouched(true)}
              className={showError ? 'invalid' : ''}
              placeholder="Expected rainfall, timing, and any precautions."
              aria-invalid={Boolean(showError)}
            />
            {showError && <span className="field-error">{errors.forecast}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish forecast'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Published forecasts</h2>
          <p>{forecasts.length} total</p>
        </div>

        {forecasts.length === 0 ? (
          <div className="empty-state">
            <WeatherIcon size={22} />
            <p>No weather forecasts published yet.</p>
          </div>
        ) : (
          <ul className="list">
            {forecasts.map((f) => (
              <li key={f.id} className="list-item">
                <div className="list-item-head">
                  <strong>{f.district}</strong>
                  <span className="badge">{f.condition}</span>
                </div>
                <p className="list-item-body">{f.forecast}</p>
                <div className="list-item-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(f.id)}
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

export default WeatherForecasts
