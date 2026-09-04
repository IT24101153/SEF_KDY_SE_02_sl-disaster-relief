import NewsManagerDashboard from '../features/news/NewsManagerDashboard.jsx'
import { useAuth } from '../lib/AuthContext.jsx'

export default function NewsManagerPage() {
  const { user } = useAuth()
  return <NewsManagerDashboard currentUser={user} />
}
