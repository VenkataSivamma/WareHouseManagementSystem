import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: '6rem', marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '12px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button onClick={() => navigate(-1)} variant="secondary">← Go Back</Button>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
