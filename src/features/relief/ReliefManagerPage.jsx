import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase.js'
import ReliefManagerDashboard from './ReliefManagerDashboard.jsx'

export default function ReliefManagerPage() {
  const [isAuthorised, setIsAuthorised] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login', { replace: true })
        return
      }

      try {
        const profile = await getDoc(doc(db, 'Users', user.uid))
        if (profile.data()?.role !== 'relief_manager') {
          navigate('/', { replace: true })
          return
        }
        setIsAuthorised(true)
      } catch {
        setIsAuthorised(false)
      }
    })
    return unsubscribe
  }, [navigate])

  async function handleLogout() {
    await signOut(auth)
    navigate('/admin/login')
  }

  if (isAuthorised !== true) {
    return <p style={{ padding: 48 }}>Checking account access...</p>
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>SRI LANKA DISASTER RELIEF CONNECT</p>
          <h1 style={{ margin: '4px 0 0' }}>Relief Manager Dashboard</h1>
        </div>
        <button type="button" onClick={handleLogout}>Log out</button>
      </header>
      <ReliefManagerDashboard db={db} />
    </main>
  )
}
