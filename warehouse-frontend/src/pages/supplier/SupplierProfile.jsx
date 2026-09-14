import { useState, useEffect } from 'react'
import { useToast } from '../../contexts/ToastContext'
import authService from '../../services/authService'
import supplierService from '../../services/supplierService'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import ProfileCard from '../../components/common/ProfileCard'

const SupplierProfile = () => {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', contactPerson: '', gstNumber: '', address: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    supplierService.getProfile().then(res => {
      const d = res.data
      setProfileData(d)
      setForm({
        fullName: d.companyName || d.name || '',
        email: d.email || '',
        phone: d.phone || '',
        contactPerson: d.contactPerson || '',
        gstNumber: d.gstNumber || d.taxId || '',
        address: d.address || d.companyAddress || '',
      })
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supplierService.updateProfile({
        companyName: form.fullName,
        phone: form.phone,
        contactPerson: form.contactPerson,
        gstNumber: form.gstNumber,
        companyAddress: form.address,
      })
      toast.success('Updated!', 'Profile updated successfully')
      setEditing(false)
    } catch (e) {
      toast.error('Error', e?.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Error', 'Passwords do not match'); return }
    if (pwdForm.newPassword.length < 8) { toast.error('Error', 'Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await authService.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      toast.success('Updated!', 'Password changed successfully')
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      toast.error('Error', e?.response?.data?.message || 'Password change failed')
    } finally { setSaving(false) }
  }

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div>
      <Breadcrumb items={[{ label: 'Supplier', path: '/supplier/dashboard' }, { label: 'Profile' }]} />
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        {!editing && <Button onClick={() => setEditing(true)}>✏️ Edit Profile</Button>}
      </div>

      <div className="grid-2">
        <ProfileCard user={profileData ? { ...profileData, fullName: profileData.companyName || profileData.name } : form} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Business Information</h3>
              {editing && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
                </div>
              )}
            </div>
            {editing ? (
              <div>
                <div className="form-row">
                  <Input label="Business Name" name="fullName" value={form.fullName} onChange={set('fullName')} />
                  <Input label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={set('contactPerson')} />
                </div>
                <div className="form-row">
                  <Input label="Phone" name="phone" value={form.phone} onChange={set('phone')} />
                  <Input label="GST Number" name="gstNumber" value={form.gstNumber} onChange={set('gstNumber')} />
                </div>
                <Input label="Address" name="address" value={form.address} onChange={set('address')} />
              </div>
            ) : (
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Business Name</div><div className="detail-value">{form.fullName}</div></div>
                <div className="detail-item"><div className="detail-label">Supplier ID</div><div className="detail-value">{form.supplierId}</div></div>
                <div className="detail-item"><div className="detail-label">Contact Person</div><div className="detail-value">{form.contactPerson}</div></div>
                <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{form.email}</div></div>
                <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{form.phone}</div></div>
                <div className="detail-item"><div className="detail-label">GST Number</div><div className="detail-value">{form.gstNumber}</div></div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}><div className="detail-label">Address</div><div className="detail-value">{form.address}</div></div>
                <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{form.category}</div></div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">🔒 Change Password</h3></div>
            <form onSubmit={handlePasswordChange}>
              <Input label="Current Password" name="currentPassword" type={showPwd ? 'text' : 'password'}
                value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Current password" iconRight={showPwd ? '🙈' : '👁️'} onIconRightClick={() => setShowPwd(p => !p)} />
              <Input label="New Password" name="newPassword" type={showPwd ? 'text' : 'password'}
                value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 8 characters" />
              <Input label="Confirm Password" name="confirmPassword" type={showPwd ? 'text' : 'password'}
                value={pwdForm.confirmPassword} onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password" />
              <Button type="submit" loading={saving}>Update Password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierProfile
