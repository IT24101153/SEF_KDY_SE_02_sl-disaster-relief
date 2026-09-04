import { useEffect, useState } from "react";
import {
  subscribeToPendingRequests,
  subscribeToScheduledRequests,
  scheduleReliefRequest,
  completeReliefRequest,
} from "./reliefRequestsService";

const TEAMS = ["Relief Team 1", "Relief Team 2", "Relief Team 3", "Red Cross Liaison"];

function PendingCard({ db, request }) {
  const [assignedTeam, setAssignedTeam] = useState(TEAMS[0]);
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!scheduledTime) {
      setError("Pick a date and time before confirming.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await scheduleReliefRequest(db, request.id, {
        assignedTeam,
        scheduledTime: new Date(scheduledTime),
      });
    } catch (err) {
      console.error("Failed to schedule relief request:", err);
      setError("Could not confirm this request. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="list-item is-pending">
      <div className="list-item-head">
        <strong>{request.district}</strong>
        <span className="badge">{request.needType}</span>
        <span className="badge status-active">Pending</span>
      </div>
      <p className="list-item-body">{request.description}</p>
      <p className="list-item-meta">{request.peopleCount} people affected</p>

      <div className="list-item-actions">
        <div className="field">
          <label htmlFor={`team-${request.id}`}>Assign team</label>
          <select
            id={`team-${request.id}`}
            value={assignedTeam}
            onChange={(e) => setAssignedTeam(e.target.value)}
          >
            {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`time-${request.id}`}>Scheduled time</label>
          <input
            id={`time-${request.id}`}
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className={error ? "invalid" : ""}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={saving}>
          {saving ? "Confirming..." : "Confirm"}
        </button>
      </div>
      {error && <span className="field-error">{error}</span>}
    </li>
  );
}

function ScheduledCard({ db, request }) {
  const [saving, setSaving] = useState(false);

  async function handleComplete() {
    setSaving(true);
    try {
      await completeReliefRequest(db, request.id);
    } catch (err) {
      console.error("Failed to mark request completed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="list-item is-scheduled">
      <div className="list-item-head">
        <strong>{request.district}</strong>
        <span className="badge">{request.needType}</span>
        <span className="badge status-resolved">Scheduled</span>
      </div>
      <p className="list-item-body">Team: {request.assignedTeam}</p>
      <div className="list-item-actions">
        <button type="button" className="btn btn-success btn-sm" onClick={handleComplete} disabled={saving}>
          {saving ? "Saving..." : "Mark completed"}
        </button>
      </div>
    </li>
  );
}

export default function ReliefManagerDashboard({ db }) {
  const [pending, setPending] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPending = subscribeToPendingRequests(db, (data) => {
      setPending(data);
      setLoading(false);
    });
    const unsubScheduled = subscribeToScheduledRequests(db, setScheduled);
    return () => {
      unsubPending();
      unsubScheduled();
    };
  }, [db]);

  return (
    <div className="stack">
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{pending.length}</span>
          <span className="stat-label">Pending requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{scheduled.length}</span>
          <span className="stat-label">Scheduled for delivery</span>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Pending relief requests</h2>
          <p>Assign a team and a time to confirm each request.</p>
        </div>
        {loading ? (
          <p className="placeholder">Loading…</p>
        ) : pending.length === 0 ? (
          <div className="empty-state">
            <strong>No pending requests</strong>
            <span>New requests from residents will appear here.</span>
          </div>
        ) : (
          <ul className="list">
            {pending.map((r) => <PendingCard key={r.id} db={db} request={r} />)}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Scheduled — awaiting delivery</h2>
          <p>Mark each one completed once relief has been delivered.</p>
        </div>
        {scheduled.length === 0 ? (
          <div className="empty-state">
            <strong>Nothing currently scheduled</strong>
            <span>Confirmed requests will appear here.</span>
          </div>
        ) : (
          <ul className="list">
            {scheduled.map((r) => <ScheduledCard key={r.id} db={db} request={r} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
