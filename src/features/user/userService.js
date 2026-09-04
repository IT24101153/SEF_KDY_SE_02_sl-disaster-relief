import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { REPORTS, RELIEF_REQUESTS } from '../../lib/collections'

export async function createDisasterReport(userId, report) {
  return addDoc(collection(db, REPORTS), {
    reportedBy: userId,
    district: report.district,
    type: report.type,
    // The form labels this "severity"; the shared data model calls it riskLevel,
    // and the Disaster Admin copies it onto the disasterAreas doc on approval.
    riskLevel: report.severity,
    description: report.description.trim(),
    status: 'pending',
    reviewedBy: null,
    createdAt: serverTimestamp(),
  })
}

export async function createReliefRequest(userId, request) {
  return addDoc(collection(db, RELIEF_REQUESTS), {
    requestedBy: userId,
    district: request.district,
    needType: request.needType,
    peopleCount: Number(request.peopleCount),
    description: request.description.trim(),
    status: 'pending',
    assignedTeam: null,
    scheduledTime: null,
    createdAt: serverTimestamp(),
  })
}

// Sorted in memory rather than with orderBy so that pairing it with `where`
// never requires a composite Firestore index.
function subscribeNewestFirst(collectionName, field, userId, callback) {
  const target = query(collection(db, collectionName), where(field, '==', userId))
  return onSnapshot(target, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    docs.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
    )
    callback(docs)
  })
}

export function subscribeToUserReports(userId, callback) {
  return subscribeNewestFirst(REPORTS, 'reportedBy', userId, callback)
}

export function subscribeToUserReliefRequests(userId, callback) {
  return subscribeNewestFirst(RELIEF_REQUESTS, 'requestedBy', userId, callback)
}

// Only pending requests are deletable — once a relief manager has assigned a
// team and time, removing the record would strand their side of the workflow.
// The same condition is enforced in firestore.rules.
export function deleteReliefRequest(requestId) {
  return deleteDoc(doc(db, RELIEF_REQUESTS, requestId))
}

// Only the four descriptive fields are writable. status, assignedTeam and
// scheduledTime belong to the Relief Manager, and firestore.rules rejects an
// update that touches anything outside this list.
export function updateReliefRequest(requestId, values) {
  return updateDoc(doc(db, RELIEF_REQUESTS, requestId), {
    district: values.district,
    needType: values.needType,
    peopleCount: Number(values.peopleCount),
    description: values.description.trim(),
  })
}
