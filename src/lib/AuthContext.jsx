import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase.js'
import { USERS } from './collections.js'

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [profileResolved, setProfileResolved] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthResolved(true)
      // A new sign-in invalidates the previous profile, and `loading` must go
      // back up in the same render — otherwise a redirect can read a null role
      // for the instant between the user arriving and their profile loading.
      setProfile(null)
      // Signed out resolves immediately; a signed-in user still needs a profile.
      setProfileResolved(!currentUser)
    })
  }, [])

  // The profile doc carries the role, so it is watched live — a role change
  // takes effect without the user signing out and back in.
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileResolved(true)
      return
    }
    return onSnapshot(
      doc(db, USERS, user.uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? snapshot.data() : null)
        setProfileResolved(true)
      },
      () => {
        setProfile(null)
        setProfileResolved(true)
      },
    )
  }, [user])

  const loading = !authResolved || !profileResolved

  return (
    <AuthContext.Provider
      value={{ user, profile, role: profile?.role ?? null, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
