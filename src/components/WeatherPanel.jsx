import { useCollectionData } from '../lib/useCollectionData.js'
import { WEATHER_FORECASTS } from '../lib/collections.js'
import './WeatherPanel.css'

// Conditions that warrant attention rather than just information.
const SEVERE = new Set(['Heavy Rain', 'Thunderstorms'])

function formatPublished(timestamp) {
  if (!timestamp?.toDate) return null
  return timestamp.toDate().toLocaleDateString('en-LK', {
    day: 'numeric',
    month: 'short',
  })
}

export default function WeatherPanel() {
  const { data: forecasts, loading } = useCollectionData(WEATHER_FORECASTS)

  // An admin can publish a district more than once; the newest entry supersedes
  // the rest. useCollectionData already sorts newest-first, so the first hit
  // per district is the current one.
  const current = []
  const seen = new Set()
  for (const forecast of forecasts) {
    if (seen.has(forecast.district)) continue
    seen.add(forecast.district)
    current.push(forecast)
  }

  if (loading) {
    return <p className="placeholder">Loading forecasts…</p>
  }

  if (current.length === 0) {
    return (
      <p className="placeholder">
        No weather forecasts published yet.
      </p>
    )
  }

  return (
    <ul className="weather-grid">
      {current.map((forecast) => {
        const published = formatPublished(forecast.createdAt)
        return (
          <li
            key={forecast.id}
            className={`weather-card${SEVERE.has(forecast.condition) ? ' severe' : ''}`}
          >
            <div className="weather-card-head">
              <strong>{forecast.district}</strong>
              <span className="weather-condition">{forecast.condition}</span>
            </div>
            <p className="weather-detail">{forecast.forecast}</p>
            {published && <p className="weather-published">Updated {published}</p>}
          </li>
        )
      })}
    </ul>
  )
}
