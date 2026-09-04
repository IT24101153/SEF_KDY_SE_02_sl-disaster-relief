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
    <li className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{request.district} — {request.needType}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">Pending</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">{request.description}</p>
      <p className="mt-1 text-xs text-slate-600">{request.peopleCount} people affected</p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700">Assign team</label>
          <select
            value={assignedTeam}
            onChange={(e) => setAssignedTeam(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Scheduled time</label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {saving ? "Confirming..." : "Confirm"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
    <li className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{request.district} — {request.needType}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-800">Scheduled</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">Team: {request.assignedTeam}</p>
      <button
        onClick={handleComplete}
        disabled={saving}
        className="mt-3 rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Mark completed"}
      </button>
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
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Pending relief requests</h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No pending requests right now.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pending.map((r) => <PendingCard key={r.id} db={db} request={r} />)}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Scheduled — awaiting delivery</h2>
        {scheduled.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Nothing currently scheduled.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {scheduled.map((r) => <ScheduledCard key={r.id} db={db} request={r} />)}
          </ul>
        )}
      </div>
    </div>
  );
}