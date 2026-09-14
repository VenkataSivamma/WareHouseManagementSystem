import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import '../css/supplier-theme.css'

const pageTitles = {
  '/supplier/dashboard': 'Dashboard',
  '/supplier/purchase-orders': 'Purchase Orders',
  '/supplier/deliveries': 'Deliveries',
  '/supplier/delivery-history': 'Delivery History',
  '/supplier/profile': 'My Profile',
}

const navItems = [
  { section: 'MAIN' },
  { to: '/supplier/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'ORDERS' },
  { to: '/supplier/purchase-orders', icon: '🛒', label: 'Purchase Orders' },
  { section: 'DELIVERIES' },
  { to: '/supplier/deliveries', icon: '🚚', label: 'Deliveries' },
  { to: '/supplier/delivery-history', icon: '📋', label: 'Delivery History' },
  { section: 'ACCOUNT' },
  { to: '/supplier/profile', icon: '👤', label: 'Profile' },
]

const SupplierLayout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[location.pathname] || 'Supplier Portal'

  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="app-layout supplier-layout">
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar navItems={navItems} portalLabel="Supplier Portal" portalIcon="🏢" />
      </div>
      <div className="main-content">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default SupplierLayout
