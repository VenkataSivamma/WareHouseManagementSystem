import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'
import '../css/admin-theme.css'

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/categories': 'Category Management',
  '/admin/products': 'Product Management',
  '/admin/suppliers': 'Supplier Management',
  '/admin/managers': 'Manager Management',
  '/admin/staff': 'Staff Management',
  '/admin/purchase-orders': 'Purchase Orders',
  '/admin/inventory': 'Inventory Management',
  '/admin/reports': 'Reports',
  '/admin/profile': 'My Profile',
}

const navItems = [
  { section: 'MAIN' },
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'MANAGEMENT' },
  { to: '/admin/categories', icon: '🏷️', label: 'Categories' },
  { to: '/admin/products', icon: '📦', label: 'Products' },
  { to: '/admin/suppliers', icon: '🏢', label: 'Suppliers' },
  { to: '/admin/managers', icon: '👔', label: 'Warehouse Managers' },
  { to: '/admin/staff', icon: '👷', label: 'Warehouse Staff' },
  { section: 'OPERATIONS' },
  { to: '/admin/purchase-orders', icon: '🛒', label: 'Purchase Orders' },
  { to: '/admin/inventory', icon: '🗄️', label: 'Inventory' },
  { section: 'ANALYTICS' },
  { to: '/admin/reports', icon: '📈', label: 'Reports' },
  { section: 'ACCOUNT' },
  { to: '/admin/profile', icon: '👤', label: 'Profile' },
]

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = pageTitles[location.pathname] || 'Admin Portal'

  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="app-layout admin-layout">
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <Sidebar navItems={navItems} portalLabel="Admin Portal" portalIcon="🛡️" />
      </div>
      <div className="main-content">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(p => !p)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
