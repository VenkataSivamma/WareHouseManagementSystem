import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import useClickOutside from '../../hooks/useClickOutside'
import Avatar from './Avatar'

const ProfileDropdown = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const ref = useClickOutside(() => setOpen(false))

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user?.role?.toLowerCase()
  const profilePath = `/${role}/profile`

  return (
    <div className="profile-dropdown" ref={ref}>
      <div className="profile-btn" onClick={() => setOpen(p => !p)}>
        <Avatar name={user?.fullName || user?.companyName || 'User'} />
        <div>
          <div className="profile-btn-name">{user?.fullName || user?.companyName || 'User'}</div>
          <div className="profile-btn-role">{user?.role}</div>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>▼</span>
      </div>
      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={() => { navigate(profilePath); setOpen(false) }}>
            👤 My Profile
          </div>
          <div className="dropdown-item" onClick={() => { navigate(`/${role}/settings`); setOpen(false) }}>
            ⚙️ Settings
          </div>
          <div className="dropdown-divider" />
          <div className="dropdown-item danger" onClick={handleLogout}>
            🚪 Logout
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
