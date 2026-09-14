import NotificationBell from './NotificationBell'
import ProfileDropdown from './ProfileDropdown'

const Topbar = ({ title, onMenuToggle }) => (
  <header className="topbar">
    <div className="topbar-left">
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuToggle}
        style={{ display: 'none' }}
        id="sidebar-toggle-btn"
      >
        ☰
      </button>
      <span className="topbar-title">{title}</span>
    </div>
    <div className="topbar-right">
      <NotificationBell />
      <ProfileDropdown />
    </div>
  </header>
)

export default Topbar
