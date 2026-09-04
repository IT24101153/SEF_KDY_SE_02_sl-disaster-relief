import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

export async function registerUser({ name, email, password }) {
  const credentials = await createUserWithEmailAndPassword(auth, email, password)

  await updateProfile(credentials.user, { displayName: name })
  await setDoc(doc(db, 'Users', credentials.user.uid), {
    id: credentials.user.uid,
    name,
    email,
    role: 'user',
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
