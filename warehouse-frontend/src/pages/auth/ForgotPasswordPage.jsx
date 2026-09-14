import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import authService from '../../services/authService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const ForgotPasswordPage = () => {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Email Sent', 'Check your inbox for reset instructions')
    } catch (err) {
      toast.error('Error', err?.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2347 40%, #1a3a6e 70%, #1a56db 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)', overflow: 'hidden',
      }}>
        <div style={{ height: 5, background: 'linear-gradient(90deg, #3b82f6, #1a56db)' }} />
        <div style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔑</div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>Forgot Password</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
              <p style={{ color: '#10b981', fontWeight: 600, marginBottom: 8 }}>Reset link sent!</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: 24 }}>
                Check your inbox at <strong style={{ color: '#fff' }}>{email}</strong>
              </p>
              <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                icon="📧"
              />
              <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
                Send Reset Link
              </Button>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
