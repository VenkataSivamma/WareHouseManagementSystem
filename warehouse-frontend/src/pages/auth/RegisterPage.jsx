import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { validateManagerRegister, validateSupplierRegister } from '../../utils/validators'
import { DEPARTMENTS, WAREHOUSE_LOCATIONS } from '../../utils/constants'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'

const managerInit = { fullName: '', employeeId: '', email: '', phone: '', department: '', warehouseLocation: '', password: '', confirmPassword: '' }
const supplierInit = { companyName: '', contactPerson: '', gstNumber: '', email: '', phone: '', companyAddress: '', password: '', confirmPassword: '' }

const roleConfig = {
  MANAGER: { icon: '👔', label: 'Warehouse Manager', subtitle: 'Register as a warehouse manager', color: '#3b82f6', glow: 'rgba(59,130,246,0.35)', badge: 'Full Access', features: ['Inventory Control', 'Reports & Analytics', 'Team Management'] },
  SUPPLIER: { icon: '🏢', label: 'Supplier Portal', subtitle: 'Register as a product supplier', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', badge: 'Partner', features: ['Order Tracking', 'Delivery Management', 'Invoice History'] },
}

const Label = ({ children, color }) => (
  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
    {children} <span style={{ color: '#ef4444' }}>*</span>
  </label>
)

const RegisterPage = () => {
  const { registerManager, registerSupplier, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'MANAGER'
  const cfg = roleConfig[role] || roleConfig.MANAGER

  const [mValues, setMValues] = useState(managerInit)
  const [sValues, setSValues] = useState(supplierInit)
  const [mErrors, setMErrors] = useState({})
  const [sErrors, setSErrors] = useState({})
  const [showMPwd, setShowMPwd] = useState(false)
  const [showSPwd, setShowSPwd] = useState(false)

  const handleM = (e) => { const { name, value } = e.target; setMValues(p => ({ ...p, [name]: value })); if (mErrors[name]) setMErrors(p => ({ ...p, [name]: '' })) }
  const handleS = (e) => { const { name, value } = e.target; setSValues(p => ({ ...p, [name]: value })); if (sErrors[name]) setSErrors(p => ({ ...p, [name]: '' })) }

  const handleManagerSubmit = async (e) => {
    e.preventDefault()
    const errs = validateManagerRegister(mValues)
    if (Object.keys(errs).length) { setMErrors(errs); return }
    const result = await registerManager(mValues)
    if (result.success) { toast.success('Registration Successful!', 'Your account is pending admin approval.'); navigate('/login') }
    else toast.error('Registration Failed', result.message)
  }

  const handleSupplierSubmit = async (e) => {
    e.preventDefault()
    const errs = validateSupplierRegister(sValues)
    if (Object.keys(errs).length) { setSErrors(errs); return }
    const result = await registerSupplier(sValues)
    if (result.success) { toast.success('Registration Successful!', 'Your supplier account is under review.'); navigate('/login') }
    else toast.error('Registration Failed', result.message)
  }

  if (role === 'MANAGER') return <Navigate to="/login" replace />

  return (
    <div className="auth-page-shell" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2347 40%, #1a3a6e 70%, #1a56db 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes orbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .reg-input-wrap .form-control { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; color: #fff !important; border-radius: 10px !important; }
        .reg-input-wrap .form-control:focus { border-color: ${cfg.color} !important; box-shadow: 0 0 0 3px ${cfg.color}30 !important; background: rgba(255,255,255,0.1) !important; }
        .reg-input-wrap .form-control::placeholder { color: rgba(255,255,255,0.3) !important; }
        .reg-input-wrap .input-icon { color: rgba(255,255,255,0.4) !important; }
        .reg-input-wrap .input-icon-right { color: rgba(255,255,255,0.4) !important; }
        .reg-input-wrap select.form-control option { background: #1e293b; color: #fff; }
        .reg-input-wrap .form-error { color: #fca5a5 !important; }
        .reg-input-wrap textarea.form-control { background: rgba(255,255,255,0.07) !important; border: 1px solid rgba(255,255,255,0.12) !important; color: #fff !important; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.color}18 0%, transparent 70%)`, top: '-200px', left: '-100px', animation: 'orbFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', bottom: '-150px', right: '-100px', animation: 'orbFloat 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>🏭</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>WareHouse IMS</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Inventory Management System</div>
          </div>
        </div>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Login
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px 40px', position: 'relative', zIndex: 10 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, borderRadius: 20, padding: '5px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: '0.75rem' }}>✨</span>
            <span style={{ color: cfg.color, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>CREATE YOUR ACCOUNT</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Join as <span style={{ background: `linear-gradient(90deg, ${cfg.color}, #a78bfa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{cfg.label}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>Fill in your details to create your portal account</p>
        </div>

        {/* Registration Card */}
        <div style={{ width: '100%', maxWidth: role === 'SUPPLIER' ? 680 : 680, animation: 'fadeSlideUp 0.5s ease 0.1s both' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: `1px solid ${cfg.color}40`, boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)`, overflow: 'hidden' }}>

            {/* Top accent bar */}
            <div style={{ height: 5, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66, transparent)` }} />

            {/* Card header */}
            <div style={{ background: `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}06)`, borderBottom: `1px solid ${cfg.color}20`, padding: '28px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: `${cfg.color}22`, border: `2px solid ${cfg.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: `0 8px 24px ${cfg.glow}` }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.3px' }}>{cfg.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: 3 }}>{cfg.subtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`, borderRadius: 12, padding: '4px 14px', fontSize: '0.72rem', fontWeight: 700, color: cfg.color, letterSpacing: '0.06em' }}>
                    {cfg.badge}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {cfg.features.map(f => (
                      <div key={f} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '3px 10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{f}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="reg-input-wrap" style={{ padding: '36px 40px 40px' }}>
              {role === 'MANAGER' && (
                <form onSubmit={handleManagerSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 4 }}>
                    <div className="form-group">
                      <Label>Full Name</Label>
                      <Input name="fullName" value={mValues.fullName} onChange={handleM} placeholder="John Smith" required icon="👤" error={mErrors.fullName} />
                    </div>
                    <div className="form-group">
                      <Label>Employee ID</Label>
                      <Input name="employeeId" value={mValues.employeeId} onChange={handleM} placeholder="EMP-001" required icon="🪪" error={mErrors.employeeId} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 4 }}>
                    <div className="form-group">
                      <Label>Email Address</Label>
                      <Input name="email" type="email" value={mValues.email} onChange={handleM} placeholder="manager@warehouse.com" required icon="📧" error={mErrors.email} />
                    </div>
                    <div className="form-group">
                      <Label>Phone Number</Label>
                      <Input name="phone" value={mValues.phone} onChange={handleM} placeholder="9876543210" required icon="📱" error={mErrors.phone} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 4 }}>
                    <div className="form-group">
                      <Label>Department</Label>
                      <Select name="department" value={mValues.department} onChange={handleM} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} required error={mErrors.department} />
                    </div>
                    <div className="form-group">
                      <Label>Warehouse Location</Label>
                      <Select name="warehouseLocation" value={mValues.warehouseLocation} onChange={handleM} options={WAREHOUSE_LOCATIONS.map(l => ({ value: l, label: l }))} required error={mErrors.warehouseLocation} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                    <div className="form-group">
                      <Label>Password</Label>
                      <Input name="password" type={showMPwd ? 'text' : 'password'} value={mValues.password} onChange={handleM} placeholder="Min 8 characters" required icon="🔒" error={mErrors.password} iconRight={showMPwd ? '🙈' : '👁️'} onIconRightClick={() => setShowMPwd(p => !p)} />
                    </div>
                    <div className="form-group">
                      <Label>Confirm Password</Label>
                      <Input name="confirmPassword" type={showMPwd ? 'text' : 'password'} value={mValues.confirmPassword} onChange={handleM} placeholder="Repeat password" required icon="🔒" error={mErrors.confirmPassword} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px 24px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `0 8px 24px ${cfg.glow}`, letterSpacing: '0.02em', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Registering...' : '👔 Register as Manager →'}
                  </button>
                </form>
              )}

              {role === 'SUPPLIER' && (
                <form onSubmit={handleSupplierSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 4 }}>
                    <div className="form-group">
                      <Label>Company Name</Label>
                      <Input name="companyName" value={sValues.companyName} onChange={handleS} placeholder="ABC Supplies Ltd." required icon="🏢" error={sErrors.companyName} />
                    </div>
                    <div className="form-group">
                      <Label>Contact Person</Label>
                      <Input name="contactPerson" value={sValues.contactPerson} onChange={handleS} placeholder="Jane Doe" required icon="👤" error={sErrors.contactPerson} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 4 }}>
                    <div className="form-group">
                      <Label>GST Number</Label>
                      <Input name="gstNumber" value={sValues.gstNumber} onChange={handleS} placeholder="22AAAAA0000A1Z5" required icon="📄" error={sErrors.gstNumber} />
                    </div>
                    <div className="form-group">
                      <Label>Phone Number</Label>
                      <Input name="phone" value={sValues.phone} onChange={handleS} placeholder="9876543210" required icon="📱" error={sErrors.phone} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 4 }}>
                    <Label>Email Address</Label>
                    <Input name="email" type="email" value={sValues.email} onChange={handleS} placeholder="contact@abcsupplies.com" required icon="📧" error={sErrors.email} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 4 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>Company Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea name="companyAddress" value={sValues.companyAddress} onChange={handleS} placeholder="Full company address..." className={`form-control${sErrors.companyAddress ? ' error' : ''}`} style={{ minHeight: 90 }} />
                    {sErrors.companyAddress && <p className="form-error" style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: 4 }}>{sErrors.companyAddress}</p>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                    <div className="form-group">
                      <Label>Password</Label>
                      <Input name="password" type={showSPwd ? 'text' : 'password'} value={sValues.password} onChange={handleS} placeholder="Min 8 characters" required icon="🔒" error={sErrors.password} iconRight={showSPwd ? '🙈' : '👁️'} onIconRightClick={() => setShowSPwd(p => !p)} />
                    </div>
                    <div className="form-group">
                      <Label>Confirm Password</Label>
                      <Input name="confirmPassword" type={showSPwd ? 'text' : 'password'} value={sValues.confirmPassword} onChange={handleS} placeholder="Repeat password" required icon="🔒" error={sErrors.confirmPassword} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px 24px', background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)`, border: 'none', borderRadius: 12, color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `0 8px 24px ${cfg.glow}`, letterSpacing: '0.02em', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Registering...' : '🏢 Register as Supplier →'}
                  </button>
                </form>
              )}

              <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Already have an account? </span>
                <Link to="/login" style={{ color: cfg.color, fontWeight: 700, fontSize: '0.9rem' }}>Sign in here →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', position: 'relative', zIndex: 10 }}>
        © 2024 WareHouse IMS · Enterprise Inventory Management
      </div>
    </div>
  )
}

export default RegisterPage
