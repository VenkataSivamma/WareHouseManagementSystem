import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import '../css/manager-theme.css'

const pageTitles = {
  '/manager/dashboard': 'Dashboard',
  '/manager/inventory': 'Inventory',
  '/manager/purchase-requests': 'Purchase Requests',
  '/manager/stock-approvals': 'Stock Approvals',
  '/manager/reports': 'Reports',
  '/manager/profile': 'My Profile',
}

const navItems = [
  { section: 'MAIN' },
  { to: '/manager/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'OPERATIONS' },
  { to: '/manager/inventory', icon: '🗄️', label: 'Inventory' },
  { to: '/manager/purchase-requests', icon: '🛒', label: 'Purchase Requests' },
  { to: '/manager/stock-approvals', icon: '✅', label: 'Stock Approvals' },
  { section: 'ANALYTICS' },
  { to: '/manager/reports', icon: '📈', label: 'Reports' },
  { section: 'ACCOUNT' },
  { to: '/manager/profile', icon: '👤', label: 'Profile' },
]

const ManagerLayout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[location.pathname] || 'Manager Portal'

  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="app-layout manager-layout">
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar navItems={navItems} portalLabel="Manager Portal" portalIcon="👔" />
      </div>
      <div className="main-content">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default ManagerLayout
