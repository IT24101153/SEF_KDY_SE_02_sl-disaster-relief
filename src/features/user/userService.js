import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'

export async function createDisasterReport(userId, report) {
  return addDoc(collection(db, 'Reports'), {
    reportedBy: userId,
    district: report.district,
    type: report.type,
    severity: report.severity,
    description: report.description,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}

export async function createReliefRequest(userId, request) {
  return addDoc(collection(db, 'ReliefRequests'), {
    requestedBy: userId,
    district: request.district,
    needType: request.needType,
    peopleCount: Number(request.peopleCount),
    description: request.description,
    status: 'pending',
    assignedTeam: '',
    scheduledTime: '',
    createdAt: serverTimestamp(),
  })
}

function sortNewestFirst(documents) {
  return documents
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((first, second) => {
      const firstTime = first.createdAt?.toMillis?.() || 0
      const secondTime = second.createdAt?.toMillis?.() || 0
      return secondTime - firstTime
    })
}

export async function getUserReports(userId) {
  const snapshot = await getDocs(query(collection(db, 'Reports'), where('reportedBy', '==', userId)))
  return sortNewestFirst(snapshot.docs)
}

export async function getUserReliefRequests(userId) {
  const snapshot = await getDocs(query(collection(db, 'ReliefRequests'), where('requestedBy', '==', userId)))
  return sortNewestFirst(snapshot.docs)
}
