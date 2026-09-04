// reliefRequestsService.js
// Firestore access layer for the ReliefRequests collection.
// Import the initialized `db` (Firestore instance) and `auth` from your team's shared firebase.js.

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { RELIEF_REQUESTS } from "../../lib/collections";

// Ordering happens in memory: Firestore refuses a `where` + `orderBy` pair on
// different fields until a composite index exists, which would break these
// listeners at runtime.
function millis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  return new Date(value).getTime() || 0;
}

function subscribeSorted(q, callback, field, direction = "desc") {
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) =>
      direction === "desc"
        ? millis(b[field]) - millis(a[field])
        : millis(a[field]) - millis(b[field]),
    );
    callback(docs);
  });
}

/**
 * Create a new relief request. Called from ReliefRequestForm.
 * @param {object} db - Firestore instance
 * @param {object} data - { district, needType, peopleCount, description }
 * @param {string} userId - current authenticated user's uid
 */
export async function submitReliefRequest(db, data, userId) {
  const payload = {
    requestedBy: userId,
    district: data.district,
    needType: data.needType,
    peopleCount: Number(data.peopleCount),
    description: data.description.trim(),
    status: "pending",
    assignedTeam: null,
    scheduledTime: null,
    createdAt: serverTimestamp(),
  };
  return addDoc(collection(db, RELIEF_REQUESTS), payload);
}

/**
 * Live-subscribe to a single user's own relief requests, newest first.
 * Used by MyReliefRequests. Returns the unsubscribe function — call it on unmount.
 */
export function subscribeToMyRequests(db, userId, callback) {
  const q = query(
    collection(db, RELIEF_REQUESTS),
    where("requestedBy", "==", userId)
  );
  return subscribeSorted(q, callback, "createdAt", "desc");
}

/**
 * Live-subscribe to all pending relief requests, oldest first (fairness order).
 * Used by ReliefManagerDashboard.
 */
export function subscribeToPendingRequests(db, callback) {
  const q = query(
    collection(db, RELIEF_REQUESTS),
    where("status", "==", "pending")
  );
  return subscribeSorted(q, callback, "createdAt", "asc");
}

/**
 * Live-subscribe to scheduled (in-progress) requests, so the manager can mark them completed.
 */
export function subscribeToScheduledRequests(db, callback) {
  const q = query(
    collection(db, RELIEF_REQUESTS),
    where("status", "==", "scheduled")
  );
  return subscribeSorted(q, callback, "scheduledTime", "asc");
}

/**
 * Relief Manager confirms a pending request: assigns a team and a time.
 */
export async function scheduleReliefRequest(db, requestId, { assignedTeam, scheduledTime }) {
  const ref = doc(db, RELIEF_REQUESTS, requestId);
  return updateDoc(ref, {
    status: "scheduled",
    assignedTeam,
    scheduledTime,
  });
}

/**
 * Relief Manager marks a scheduled request as completed once relief is delivered.
 */
export async function completeReliefRequest(db, requestId) {
  const ref = doc(db, RELIEF_REQUESTS, requestId);
  return updateDoc(ref, { status: "completed" });
}