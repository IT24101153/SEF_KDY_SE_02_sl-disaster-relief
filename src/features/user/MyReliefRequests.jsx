import { useEffect, useState } from "react";
import { subscribeToMyRequests } from "../relief/reliefRequestsService";

const STATUS_LABEL = {
  pending: "Pending review",
  scheduled: "Scheduled",
  completed: "Completed",
};

function formatTime(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function MyReliefRequests({ db, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToMyRequests(db, currentUser.uid, (data) => {
      setRequests(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [db, currentUser]);

  if (loading) {
    return <p className="placeholder">Loading your requests...</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <strong>No relief requests yet</strong>
        <span>Anything you submit will appear here.</span>
      </div>
    );
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>My relief requests</h2>
        <p>{requests.length} total</p>
      </div>
      <ul className="list">
        {requests.map((r) => (
          <li key={r.id} className={`list-item is-${r.status}`}>
            <div className="list-item-head">
              <strong>{r.district}</strong>
              <span className="badge">{r.needType}</span>
              <span className={`status-badge ${r.status}`}>
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
            <p className="list-item-body">{r.description}</p>
            <p className="list-item-meta">{r.peopleCount} people affected</p>
            {r.status === "scheduled" && (
              <div className="schedule-note">
                <strong>{r.assignedTeam}</strong>
                <span>Scheduled for {formatTime(r.scheduledTime)}</span>
              </div>
            )}
            {r.status === "completed" && (
              <div className="schedule-note">
                <strong>Relief delivered</strong>
                <span>Thank you for reporting.</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
