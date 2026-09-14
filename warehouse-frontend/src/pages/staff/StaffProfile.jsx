import { useState, useEffect } from 'react'
import { useToast } from '../../contexts/ToastContext'
import authService from '../../services/authService'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import ProfileCard from '../../components/common/ProfileCard'
import { DEPARTMENTS, WAREHOUSE_LOCATIONS } from '../../utils/constants'

const StaffProfile = () => {
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', employeeId: '', department: '', warehouseLocation: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    authService.getProfile().then(res => {
      const d = res.data
      setProfileData(d)
      setForm({
        fullName: d.fullName || d.name || '',
        email: d.email || '',
        phone: d.phone || '',
        employeeId: d.employeeId || '',
        department: d.department || '',
        warehouseLocation: d.warehouseLocation || '',
      })
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateProfile({ fullName: form.fullName, phone: form.phone, department: form.department, warehouseLocation: form.warehouseLocation })
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

  return (
    <div>
      <Breadcrumb items={[{ label: 'Staff', path: '/staff/dashboard' }, { label: 'Profile' }]} />
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        {!editing && <Button onClick={() => setEditing(true)}>✏️ Edit Profile</Button>}
      </div>

      <div className="grid-2">
        <ProfileCard user={profileData || form} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Profile Information</h3>
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
                  <Input label="Full Name" name="fullName" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
                  <Input label="Phone" name="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-row">
                  <Select label="Department" name="department" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                  <Select label="Warehouse Location" name="warehouseLocation" value={form.warehouseLocation} onChange={e => setForm(p => ({ ...p, warehouseLocation: e.target.value }))} options={WAREHOUSE_LOCATIONS.map(l => ({ value: l, label: l }))} />
                </div>
              </div>
            ) : (
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Full Name</div><div className="detail-value">{form.fullName}</div></div>
                <div className="detail-item"><div className="detail-label">Employee ID</div><div className="detail-value">{form.employeeId}</div></div>
                <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{form.email}</div></div>
                <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{form.phone}</div></div>
                <div className="detail-item"><div className="detail-label">Department</div><div className="detail-value">{form.department}</div></div>
                <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{form.warehouseLocation}</div></div>
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

export default StaffProfile
