import { useEffect, useState } from "react";
import { subscribeToMyRequests } from "../relief/reliefRequestsService";

const STATUS_STYLES = {
  pending: "border-amber-500 bg-amber-50 text-amber-800",
  scheduled: "border-blue-500 bg-blue-50 text-blue-800",
  completed: "border-teal-600 bg-teal-50 text-teal-800",
};

const STATUS_LABEL = {
  pending: "Pending review",
  scheduled: "Scheduled",
  completed: "Completed",
};

function formatTime(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
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
    return <p className="text-sm text-slate-500">Loading your requests...</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-6 text-center">
        <p className="text-slate-600">You haven't submitted any relief requests yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">My relief requests</h2>
      <ul className="space-y-3">
        {requests.map((r) => (
          <li
            key={r.id}
            className={`rounded-md border-l-4 p-4 ${STATUS_STYLES[r.status] ?? "border-slate-300 bg-slate-50 text-slate-800"}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{r.district} — {r.needType}</span>
              <span className="text-xs font-semibold uppercase tracking-wide">
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
            <p className="mt-1 text-sm">{r.description}</p>
            <p className="mt-1 text-xs text-slate-600">{r.peopleCount} people affected</p>
            {r.status === "scheduled" && (
              <p className="mt-2 text-sm font-medium">
                Team "{r.assignedTeam}" scheduled for {formatTime(r.scheduledTime)}
              </p>
            )}
            {r.status === "completed" && (
              <p className="mt-2 text-sm font-medium">Relief delivered. Thank you for reporting.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}