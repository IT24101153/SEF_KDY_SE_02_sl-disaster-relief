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
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const RELIEF_REQUESTS = "reliefRequests";

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
    where("requestedBy", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Live-subscribe to all pending relief requests, oldest first (fairness order).
 * Used by ReliefManagerDashboard.
 */
export function subscribeToPendingRequests(db, callback) {
  const q = query(
    collection(db, RELIEF_REQUESTS),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Live-subscribe to scheduled (in-progress) requests, so the manager can mark them completed.
 */
export function subscribeToScheduledRequests(db, callback) {
  const q = query(
    collection(db, RELIEF_REQUESTS),
    where("status", "==", "scheduled"),
    orderBy("scheduledTime", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
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