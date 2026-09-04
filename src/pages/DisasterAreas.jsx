import { useMemo, useState } from 'react'
import { useCollectionData } from '../lib/useCollectionData.js'
import { DISASTER_AREAS } from '../lib/collections.js'
import { DISASTER_TYPES, RISK_LEVELS, SRI_LANKA_DISTRICTS } from '../lib/districts.js'
import './DisasterAreas.css'

const ALL = 'all'

export default function DisasterAreas() {
  const { data: areas, loading } = useCollectionData(DISASTER_AREAS)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState(ALL)
  const [type, setType] = useState(ALL)
  const [riskLevel, setRiskLevel] = useState(ALL)

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return areas.filter((area) => {
      if (district !== ALL && area.district !== district) return false
      if (type !== ALL && area.type !== type) return false
      if (riskLevel !== ALL && area.riskLevel !== riskLevel) return false
      if (!term) return true
      return [area.district, area.type, area.riskLevel, area.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [areas, search, district, type, riskLevel])

  function resetFilters() {
    setSearch('')
    setDistrict(ALL)
    setType(ALL)
    setRiskLevel(ALL)
  }

  const filtersApplied =
    search.trim() !== '' || district !== ALL || type !== ALL || riskLevel !== ALL

  return (
    <div className="areas-page">
      <header className="areas-head">
        <h1>Disaster Areas</h1>
        <p>
          Every district currently reported as affected or at risk. Search by
          name or narrow the list with the filters below.
        </p>
      </header>

      <div className="areas-filters">
        <label className="areas-search">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search district, type or description"
          />
        </label>

        <label>
          <span>District</span>
          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value={ALL}>All districts</option>
            {SRI_LANKA_DISTRICTS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value={ALL}>All types</option>
            {DISASTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Risk level</span>
          <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
            <option value={ALL}>All risk levels</option>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="areas-count">
        Showing {visible.length} of {areas.length} areas
        {filtersApplied && (
          <button type="button" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </p>

      {loading ? (
        <p className="placeholder">Loading disaster areas…</p>
      ) : visible.length === 0 ? (
        <div className="areas-empty">
          <p>
            {areas.length === 0
              ? 'No disaster areas have been published yet.'
              : 'No areas match these filters.'}
          </p>
        </div>
      ) : (
        <ul className="areas-list">
          {visible.map((area) => (
            <li key={area.id} className={`area-card risk-${area.riskLevel}`}>
              <div className="area-card-head">
                <strong>{area.district}</strong>
                <span className="area-tag">{area.type}</span>
                <span className={`area-tag risk risk-${area.riskLevel}`}>
                  {area.riskLevel} risk
                </span>
                {area.status && (
                  <span className={`area-tag status-${area.status}`}>
                    {area.status}
                  </span>
                )}
              </div>
              <p>{area.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
