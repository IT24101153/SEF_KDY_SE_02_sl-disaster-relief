import { InboxIcon } from './icons.jsx'

function PendingReports({ reports, loading, onReview }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Reports awaiting review</h2>
        <p>Approved reports appear on the public Disaster Areas list.</p>
      </div>

      {loading ? (
        <p className="placeholder">Loading reports…</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <InboxIcon size={22} />
          <p>No pending reports right now.</p>
        </div>
      ) : (
        <ul className="list">
          {reports.map((report) => (
            <li key={report.id} className="list-item">
              <div className="list-item-head">
                <strong>{report.district}</strong>
                <span className="badge">{report.type}</span>
              </div>
              <p className="list-item-body">{report.description}</p>
              <div className="list-item-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={() => onReview(report, 'approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => onReview(report, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PendingReports
