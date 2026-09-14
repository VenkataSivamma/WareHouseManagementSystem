import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import authService from '../../services/authService'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const ResetPasswordPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid Link', 'No reset token found in URL')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Error', 'Passwords do not match')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('Error', 'Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword({ token, newPassword: form.newPassword })
      toast.success('Success', 'Password reset successfully. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error('Error', err?.response?.data?.message || 'Reset failed. Link may have expired.')
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
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
            <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.8rem', marginBottom: 8 }}>Reset Password</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Enter your new password below</p>
          </div>

          {!token ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ef4444', marginBottom: 16 }}>Invalid or missing reset token.</p>
              <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                label="New Password"
                name="newPassword"
                type={showPwd ? 'text' : 'password'}
                value={form.newPassword}
                onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 6 characters"
                required
                icon="🔒"
                iconRight={showPwd ? '🙈' : '👁️'}
                onIconRightClick={() => setShowPwd(p => !p)}
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type={showPwd ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                required
                icon="🔒"
              />
              <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
                Reset Password
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

export default ResetPasswordPage
