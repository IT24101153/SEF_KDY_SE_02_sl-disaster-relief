import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { ROLES, USERS } from '../../lib/collections'

export async function registerUser({ name, email, password }) {
  const credentials = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(credentials.user, { displayName: name })
  await setDoc(doc(db, USERS, credentials.user.uid), {
    id: credentials.user.uid,
    name,
    email,
    role: ROLES.USER,
    createdAt: serverTimestamp(),
  })

  return credentials.user
}

export async function loginUser(email, password) {
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  return credentials.user
}

export function logoutUser() {
  return signOut(auth)
}
