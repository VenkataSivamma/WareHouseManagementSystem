import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
// navigate removed — using window.location.href to avoid state race condition
import { useToast } from '../../contexts/ToastContext'
import { validateManagerLogin, validateStaffLogin } from '../../utils/validators'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const roles = [
  {
    key: 'MANAGER',
    label: 'Warehouse Manager',
    icon: '👔',
    desc: 'Manage inventory, approve stock movements and generate reports',
    features: ['Inventory Control', 'Reports & Analytics', 'Team Management'],
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    badge: 'Full Access',
    badgeColor: '#3b82f6',
  },
  {
    key: 'STAFF',
    label: 'Warehouse Staff',
    icon: '👷',
    desc: 'Handle stock in/out operations and product tracking',
    features: ['Stock Operations', 'Product Search', 'Task Management'],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
    badge: 'Operations',
    badgeColor: '#10b981',
  },
  {
    key: 'SUPPLIER',
    label: 'Supplier Portal',
    icon: '🏢',
    desc: 'View purchase orders, manage deliveries and track payments',
    features: ['Order Tracking', 'Delivery Management', 'Invoice History'],
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    badge: 'Partner',
    badgeColor: '#f59e0b',
  },
]

const stats = [
  { icon: '📦', value: '50,000+', label: 'Products Tracked' },
  { icon: '🚚', value: '1,200+', label: 'Daily Deliveries' },
  { icon: '🏭', value: '12', label: 'Warehouses' },
  { icon: '👥', value: '300+', label: 'Active Users' },
]

const LoginPage = () => {
  const { managerLogin, staffLogin, supplierLogin, loading } = useAuth()
  const { toast } = useToast()

  const [selectedRole, setSelectedRole] = useState(null)
  const [hoveredRole, setHoveredRole] = useState(null)
  const [values, setValues] = useState({ email: '', identifier: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setErrors({})
    setValues({ email: '', identifier: '', password: '', rememberMe: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let errs = {}
    let result

    if (selectedRole === 'MANAGER') {
      errs = validateManagerLogin(values)
      if (Object.keys(errs).length) { setErrors(errs); return }
      result = await managerLogin({ email: values.email, password: values.password })
      if (result.success) { toast.success('Welcome!', 'Logged in as Warehouse Manager'); window.location.href = '/manager/dashboard'; return }
    } else if (selectedRole === 'STAFF') {
      errs = validateStaffLogin(values)
      if (Object.keys(errs).length) { setErrors(errs); return }
      result = await staffLogin({ identifier: values.identifier, password: values.password })
      if (result.success) { toast.success('Welcome!', 'Logged in as Warehouse Staff'); window.location.href = '/staff/dashboard'; return }
    } else if (selectedRole === 'SUPPLIER') {
      errs = validateManagerLogin(values)
      if (Object.keys(errs).length) { setErrors(errs); return }
      result = await supplierLogin({ email: values.email, password: values.password })
      if (result.success) { toast.success('Welcome!', 'Logged in as Supplier'); window.location.href = '/supplier/dashboard'; return }
    }

    if (result && !result.success) toast.error('Login Failed', result.message)
  }

  const activeRole = roles.find(r => r.key === selectedRole)

  return (
    <div className="portal-home auth-page-shell" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2347 40%, #1a3a6e 70%, #1a56db 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', top: '-200px', left: '-100px', animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', bottom: '-150px', right: '-100px', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', top: '40%', right: '20%', animation: 'orbFloat 12s ease-in-out infinite' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <style>{`
        @keyframes orbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmerBadge { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .role-portal-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .role-portal-card:hover { transform: translateY(-8px) scale(1.02); }
      `}</style>

      {/* Header */}
      <div style={{ padding: '22px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>🏭</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>WareHouse IMS</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Inventory Management System</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>System Online</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', position: 'relative', zIndex: 10 }}>

        {!selectedRole ? (
          <div style={{ width: '100%', maxWidth: 1100, animation: 'fadeSlideUp 0.5s ease' }}>

            {/* Hero text */}
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: '6px 18px', marginBottom: 20 }}>
                <span style={{ fontSize: '0.75rem' }}>✨</span>
                <span style={{ color: '#93c5fd', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>ENTERPRISE WAREHOUSE PLATFORM</span>
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: 14, lineHeight: 1.15, letterSpacing: '-1px' }}>
                Welcome to <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WareHouse IMS</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Select your portal to access your personalized dashboard and tools
              </p>
            </div>

            {/* Role cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 52 }}>
              {roles.map((r, i) => (
                <div
                  key={r.key}
                  className="role-portal-card"
                  onClick={() => handleRoleSelect(r.key)}
                  onMouseEnter={() => setHoveredRole(r.key)}
                  onMouseLeave={() => setHoveredRole(null)}
                  style={{
                    background: hoveredRole === r.key
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: hoveredRole === r.key
                      ? `1px solid ${r.color}`
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    padding: '32px 28px',
                    cursor: 'pointer',
                    boxShadow: hoveredRole === r.key
                      ? `0 20px 60px ${r.glow}, 0 0 0 1px ${r.color}`
                      : '0 8px 32px rgba(0,0,0,0.3)',
                    animation: `fadeSlideUp 0.5s ease ${i * 0.1}s both`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top glow accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${r.color}, transparent)`, opacity: hoveredRole === r.key ? 1 : 0.4, transition: 'opacity 0.3s' }} />

                  {/* Badge */}
                  <div style={{ position: 'absolute', top: 18, right: 18, background: `${r.color}22`, border: `1px solid ${r.color}55`, borderRadius: 12, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, color: r.color, letterSpacing: '0.05em', animation: 'shimmerBadge 3s ease infinite' }}>
                    {r.badge}
                  </div>

                  {/* Icon */}
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: `${r.color}20`, border: `1px solid ${r.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 20, boxShadow: hoveredRole === r.key ? `0 0 20px ${r.glow}` : 'none', transition: 'box-shadow 0.3s' }}>
                    {r.icon}
                  </div>

                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>{r.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>{r.desc}</div>

                  {/* Feature list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {r.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${r.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: r.color, flexShrink: 0 }}>✓</div>
                        <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: r.color, fontWeight: 700, fontSize: '0.9rem' }}>Access Portal</span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${r.color}20`, border: `1px solid ${r.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, fontSize: '1rem', transition: 'transform 0.2s', transform: hoveredRole === r.key ? 'translateX(4px)' : 'none' }}>→</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 32px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', padding: '0 16px' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 560, animation: 'fadeSlideUp 0.4s ease' }}>
            <button onClick={() => setSelectedRole(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '9px 18px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
              ← Back to portal selection
            </button>

            {/* Glassmorphism login card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: `1px solid ${activeRole?.color}50`, boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)`, overflow: 'hidden' }}>

              {/* Colored top bar */}
              <div style={{ height: 5, background: `linear-gradient(90deg, ${activeRole?.color}, ${activeRole?.color}66, transparent)` }} />

              {/* Card header banner */}
              <div style={{ background: `linear-gradient(135deg, ${activeRole?.color}18, ${activeRole?.color}08)`, borderBottom: `1px solid ${activeRole?.color}25`, padding: '28px 40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: `${activeRole?.color}22`, border: `2px solid ${activeRole?.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: `0 8px 24px ${activeRole?.glow}` }}>
                    {activeRole?.icon}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.3px' }}>{activeRole?.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Secure Portal Access</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: `${activeRole?.color}22`, border: `1px solid ${activeRole?.color}44`, borderRadius: 12, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, color: activeRole?.color, letterSpacing: '0.06em' }}>
                    {activeRole?.badge}
                  </div>
                </div>
              </div>

              {/* Form area */}
              <div style={{ padding: '32px 40px 36px' }}>
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>Sign In</h1>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>Enter your credentials to access your portal</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {selectedRole === 'STAFF' ? (
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>Employee ID or Email <span style={{ color: '#ef4444' }}>*</span></label>
                      <Input name="identifier" value={values.identifier} onChange={handleChange}
                        placeholder="EMP-001 or email@warehouse.com" required icon="🪪" error={errors.identifier} />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <Input name="email" type="email" value={values.email} onChange={handleChange}
                        placeholder="Enter your email" required icon="📧" error={errors.email} />
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <Input name="password" type={showPassword ? 'text' : 'password'}
                      value={values.password} onChange={handleChange}
                      placeholder="Enter your password" required icon="🔒" error={errors.password}
                      iconRight={showPassword ? '🙈' : '👁️'} onIconRightClick={() => setShowPassword(p => !p)} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="rememberMe" name="rememberMe" checked={values.rememberMe} onChange={handleChange} style={{ width: 16, height: 16, accentColor: activeRole?.color }} />
                      <label htmlFor="rememberMe" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer' }}>Remember me</label>
                    </div>
                    <Link to="/forgot-password" style={{ color: activeRole?.color, fontSize: '0.9rem', fontWeight: 600 }}>Forgot Password?</Link>
                  </div>

                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 24px', background: `linear-gradient(135deg, ${activeRole?.color}, ${activeRole?.color}bb)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `0 8px 24px ${activeRole?.glow}`, letterSpacing: '0.02em', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Signing in...' : `Sign In to ${activeRole?.label} →`}
                  </button>
                </form>

                {selectedRole === 'SUPPLIER' && (
                  <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>Don't have an account? </span>
                    <Link to={`/register?role=${selectedRole}`} style={{ color: activeRole?.color, fontWeight: 700, fontSize: '0.9rem' }}>Register here →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', position: 'relative', zIndex: 10 }}>
        © 2024 WareHouse IMS · Enterprise Inventory Management
      </div>
    </div>
  )
}

export default LoginPage
