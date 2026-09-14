import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import { getRoleDashboard } from '../utils/helpers'

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: '6rem', marginBottom: 16 }}>🚫</div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--danger)', lineHeight: 1 }}>403</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '12px 0 8px' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
          You don't have permission to access this page. Please contact your administrator.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {isAuthenticated
            ? <Button onClick={() => navigate(getRoleDashboard(role))}>Go to Dashboard</Button>
            : <Button onClick={() => navigate('/login')}>Go to Login</Button>
          }
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
