import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase.js'
import { SRI_LANKA_DISTRICTS } from '../lib/districts.js'
import './SriLankaMap.css'

const LON_MIN = 79.6
const LON_MAX = 81.95
const LAT_MIN = 5.85
const LAT_MAX = 9.85
const WIDTH = 260
const HEIGHT = 460

function project(lat, lon) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * WIDTH
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * HEIGHT
  return [x, y]
}

// Simplified coastal outline (not survey-accurate) used only to render a
// recognizable island silhouette behind the district markers.
const OUTLINE = [
  [9.83, 80.23],
  [9.72, 80.63],
  [9.5, 80.35],
  [9.25, 80.8],
  [8.58, 81.22],
  [7.72, 81.68],
  [6.85, 81.85],
  [6.2, 81.35],
  [5.92, 80.6],
  [6.03, 80.22],
  [6.93, 79.85],
  [7.21, 79.84],
  [8.23, 79.72],
  [8.98, 79.9],
  [9.6, 79.95],
]

const OUTLINE_PATH =
  OUTLINE.map(([lat, lon], i) => {
    const [x, y] = project(lat, lon)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ') + ' Z'

// Risk reads as intensity of red, dropping to neutral ink at the low end.
const RISK_COLOR = {
  high: '#d81f2a',
  medium: '#e8737b',
  low: '#4a4a52',
}

function SriLankaMap() {
  const [warningsByDistrict, setWarningsByDistrict] = useState({})

  useEffect(() => {
    const activeWarnings = query(
      collection(db, 'disasterAreas'),
      where('status', '==', 'active'),
    )
    const unsubscribe = onSnapshot(activeWarnings, (snapshot) => {
      const byDistrict = {}
      snapshot.docs.forEach((d) => {
        const data = d.data()
        byDistrict[data.district] = data
      })
      setWarningsByDistrict(byDistrict)
    })
    return unsubscribe
  }, [])

  const activeCount = Object.keys(warningsByDistrict).length

  return (
    <div className="sl-map">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Simplified map of Sri Lanka showing active disaster warnings by district"
      >
        <path className="sl-map-outline" d={OUTLINE_PATH} />
        {SRI_LANKA_DISTRICTS.map((d) => {
          const warning = warningsByDistrict[d.name]
          const [x, y] = project(d.lat, d.lon)
          const color = warning ? RISK_COLOR[warning.riskLevel] : null
          return (
            <circle
              key={d.name}
              cx={x}
              cy={y}
              r={warning ? 6 : 3.5}
              className="sl-map-marker"
              style={color ? { fill: color } : undefined}
            >
              <title>
                {warning
                  ? `${d.name} — ${warning.riskLevel} risk ${warning.type} (active)`
                  : `${d.name} — no active warning`}
              </title>
            </circle>
          )
        })}
      </svg>

      <div className="sl-map-legend">
        <span>
          <i className="dot" style={{ background: RISK_COLOR.high }} /> High
          risk
        </span>
        <span>
          <i className="dot" style={{ background: RISK_COLOR.medium }} />{' '}
          Medium risk
        </span>
        <span>
          <i className="dot" style={{ background: RISK_COLOR.low }} /> Low
          risk
        </span>
        <span>
          <i className="dot no-warning" /> No active warning
        </span>
      </div>

      {activeCount > 0 ? (
        <ul className="sl-map-list">
          {Object.entries(warningsByDistrict).map(([district, w]) => (
            <li key={district}>
              <strong>{district}</strong> — {w.riskLevel} risk {w.type}
            </li>
          ))}
        </ul>
      ) : (
        <p className="placeholder">No active disaster warnings.</p>
      )}
    </div>
  )
}

export default SriLankaMap
