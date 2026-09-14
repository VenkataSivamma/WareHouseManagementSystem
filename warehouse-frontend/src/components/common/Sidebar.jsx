import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SidebarItem = ({ to, icon, label, badge }) => (
  <NavLink to={to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
    <span className="sidebar-item-icon">{icon}</span>
    <span>{label}</span>
    {badge && <span className="sidebar-item-badge">{badge}</span>}
  </NavLink>
)

const SidebarSection = ({ label }) => <div className="sidebar-section">{label}</div>

const Sidebar = ({ navItems, portalLabel, portalIcon = '🏭' }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">{portalIcon}</span>
        <div>
          <div className="sidebar-logo-text">WareHouse IMS</div>
          <div className="sidebar-logo-sub">{portalLabel}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section
            ? <SidebarSection key={i} label={item.section} />
            : <SidebarItem key={i} to={item.to} icon={item.icon} label={item.label} badge={item.badge} />
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Logout">
          <div className="avatar" style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.8rem' }}>
            {(user?.fullName || user?.companyName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || user?.companyName || 'User'}</div>
            <div className="sidebar-user-role">🚪 Logout</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
