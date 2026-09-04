import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'

const AdminLogin = lazy(() => import('./features/admin/Login.jsx'))
const AdminDashboard = lazy(() => import('./features/admin/Admin.jsx'))

function App() {
  return (
    <Suspense fallback={<p style={{ padding: 48 }}>Loading…</p>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default App
