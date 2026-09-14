import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import '../css/staff-theme.css'

const pageTitles = {
  '/staff/dashboard': 'Dashboard',
  '/staff/stock-in': 'Stock In',
  '/staff/stock-out': 'Stock Out',
  '/staff/inventory': 'Inventory',
  '/staff/product-search': 'Product Search',
  '/staff/profile': 'My Profile',
}

const navItems = [
  { section: 'MAIN' },
  { to: '/staff/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'OPERATIONS' },
  { to: '/staff/stock-in', icon: '📥', label: 'Stock In' },
  { to: '/staff/stock-out', icon: '📤', label: 'Stock Out' },
  { to: '/staff/inventory', icon: '🗄️', label: 'Inventory' },
  { to: '/staff/product-search', icon: '🔍', label: 'Product Search' },
  { section: 'ACCOUNT' },
  { to: '/staff/profile', icon: '👤', label: 'Profile' },
]

const StaffLayout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[location.pathname] || 'Staff Portal'

  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="app-layout staff-layout">
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar navItems={navItems} portalLabel="Staff Portal" portalIcon="👷" />
      </div>
      <div className="main-content">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default StaffLayout
