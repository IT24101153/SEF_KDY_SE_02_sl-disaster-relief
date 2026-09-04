import { Suspense, lazy, useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import Landing from './pages/Landing.jsx'
import { auth } from './firebase.js'

const AdminLogin = lazy(() => import('./features/admin/Login.jsx'))
const AdminDashboard = lazy(() => import('./features/admin/Admin.jsx'))
const NewsManagerDashboard = lazy(() => import('./features/news/NewsManagerDashboard.jsx'))

const NEWS_MANAGER_EMAIL = 'news@manager.com'

function NewsManagerRoute() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  if (user === undefined) return <p style={{ padding: 48 }}>Loading…</p>
  if (user?.email?.toLowerCase() !== NEWS_MANAGER_EMAIL) {
    return <Navigate to="/admin/login" replace />
  }

  return <NewsManagerDashboard currentUser={user} />
}

function App() {
  return (
    <Suspense fallback={<p style={{ padding: 48 }}>Loading…</p>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/news-manager" element={<NewsManagerRoute />} />
      </Routes>
    </Suspense>
  )
}

export default App
