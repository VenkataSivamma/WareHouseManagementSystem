import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { validateAdminLogin } from '../../utils/validators'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const AdminLoginPage = () => {
  const { adminLogin, loading } = useAuth()
  const { toast } = useToast()

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateAdminLogin(values)
    if (Object.keys(errs).length) { setErrors(errs); return }
    const result = await adminLogin(values)
    if (result.success) {
      toast.success('Welcome back!', 'Logged in as Administrator')
      window.location.href = '/admin/dashboard'
    } else {
      toast.error('Login Failed', result.message)
    }
  }

  return (
    <div className="auth-page-shell" style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}>🛡️</div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>
            System Administration
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Restricted access — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1e293b',
          borderRadius: 16,
          padding: '36px 32px',
          border: '1px solid #334155',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Admin Email</label>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input
                  name="email" type="email" value={values.email}
                  onChange={handleChange} placeholder="admin@warehouse.com"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  style={{ background: '#0f172a', color: '#f1f5f9', borderColor: '#334155' }}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Password</label>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={values.password} onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-control${errors.password ? ' error' : ''}`}
                  style={{ background: '#0f172a', color: '#f1f5f9', borderColor: '#334155' }}
                />
                <span className="input-icon-right" onClick={() => setShowPassword(p => !p)} style={{ cursor: 'pointer' }}>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <Button type="submit" full loading={loading} size="lg" style={{ marginTop: 8 }}>
              Sign In
            </Button>
          </form>

          <div style={{
            marginTop: 20, padding: '10px 14px',
            background: 'rgba(234,179,8,0.1)', borderRadius: 8,
            border: '1px solid rgba(234,179,8,0.3)',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#ca8a04', margin: 0 }}>
              ⚠️ Unauthorized access attempts are monitored and logged.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: '#334155' }}>
          WareHouse IMS © {new Date().getFullYear()} — Admin Portal
        </p>
      </div>
    </div>
  )
}

export default AdminLoginPage
