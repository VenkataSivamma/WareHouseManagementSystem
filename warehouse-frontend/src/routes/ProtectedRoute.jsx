import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRoleDashboard } from '../utils/helpers'

const ProtectedRoute = ({ allowedRole, layout: Layout }) => {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRole && role?.toUpperCase() !== allowedRole.toUpperCase()) {
    return <Navigate to={getRoleDashboard(role)} replace />
  }

  if (Layout) return <Layout><Outlet /></Layout>
  return <Outlet />
}

export const PublicRoute = () => {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated) return <Navigate to={getRoleDashboard(role)} replace />
  return <Outlet />
}

export const AdminPublicRoute = () => {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated && role?.toUpperCase() === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Outlet />
}

export default ProtectedRoute
