import { Suspense, lazy } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import { ROLES } from './lib/collections.js'

const DisasterAreas = lazy(() => import('./pages/DisasterAreas.jsx'))
const NewsFeed = lazy(() => import('./features/news/NewsFeed.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const AdminLogin = lazy(() => import('./features/admin/Login.jsx'))
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage.jsx'))
const AdminDashboard = lazy(() => import('./features/admin/Admin.jsx'))
const NewsManagerPage = lazy(() => import('./pages/NewsManagerPage.jsx'))
const ReliefManagerPage = lazy(() => import('./features/relief/ReliefManagerPage.jsx'))

// Public pages share the role-aware navbar; each role console ships its own chrome.
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <Suspense fallback={<p className="route-loading">Loading…</p>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/disaster-areas" element={<DisasterAreas />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allow={[ROLES.USER]}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={[ROLES.DISASTER_ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news-manager"
          element={
            <ProtectedRoute allow={[ROLES.NEWS_MANAGER]}>
              <NewsManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relief-manager"
          element={
            <ProtectedRoute allow={[ROLES.RELIEF_MANAGER]}>
              <ReliefManagerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
