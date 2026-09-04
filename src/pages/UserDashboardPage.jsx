import UserDashboard from '../features/user/UserDashboard.jsx'
import { useAuth } from '../lib/AuthContext.jsx'

export default function UserDashboardPage() {
  const { user } = useAuth()
  return <UserDashboard user={user} />
}
