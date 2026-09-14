import { useState, useEffect } from 'react'
import StatCard from '../../components/common/StatCard'
import { BarChart, DonutChart } from '../../components/common/Charts'
import ActivityFeed from '../../components/common/ActivityFeed'
import Breadcrumb from '../../components/common/Breadcrumb'
import { SkeletonStatCards } from '../../components/common/Skeleton'
import dashboardService from '../../services/dashboardService'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [barData, setBarData] = useState([])
  const [donutData, setDonutData] = useState([])
  const [activities, setActivities] = useState([])
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, chartsRes, actRes] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getAdminCharts(),
          dashboardService.getAdminActivities(),
        ])
        setStats((statsRes.data || []).map(stat => ({ ...stat, label: stat.label ?? stat.title })))
        setBarData((chartsRes.data?.stockMovement || []).map(item => ({
          label: item.label ?? item.month ?? 'Period',
          value: item.value ?? item.stockIn ?? 0,
          value2: item.value2 ?? item.stockOut ?? 0,
        })))
        setDonutData((chartsRes.data?.categoryDistribution || []).map(item => ({
          label: item.label ?? item.name ?? 'Category',
          value: item.value ?? 0,
        })))
        setActivities((actRes.data?.activities || []).map(activity => ({
          ...activity,
          text: activity.text ?? activity.message,
          time: activity.time ?? activity.createdAt,
        })))
        setLowStock(actRes.data?.lowStockItems || [])
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const catColors = { Furniture: '#a78bfa', Electronics: '#38bdf8', Stationery: '#34d399', Safety: '#fb923c' }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin' }, { label: 'Dashboard' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Admin Dashboard</h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem' }}>Welcome back! Here's what's happening in your warehouse today.</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-secondary, var(--text-secondary))', background: 'var(--admin-surface-2, var(--bg))', padding: '10px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--admin-border, var(--border))', fontWeight: 500 }}>
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {loading ? <SkeletonStatCards count={10} /> : (
        <div className="stat-cards">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {barData.length > 0 && donutData.length > 0 && (
        <div className="grid-2 mb-24">
          <BarChart title="Monthly Stock Movement" subtitle="Stock In vs Stock Out" data={barData} />
          <DonutChart title="Stock Distribution by Category" data={donutData} />
        </div>
      )}

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.05rem' }}>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions">
            {[
              { icon: '📦', label: 'Add Product', path: '/admin/products' },
              { icon: '🏷️', label: 'Add Category', path: '/admin/categories' },
              { icon: '🛒', label: 'New Order', path: '/admin/purchase-orders' },
              { icon: '🏢', label: 'Add Supplier', path: '/admin/suppliers' },
              { icon: '👔', label: 'Add Manager', path: '/admin/managers' },
              { icon: '📈', label: 'View Reports', path: '/admin/reports' },
            ].map((a, i) => (
              <a key={i} href={a.path} className="quick-action-btn">
                <span className="quick-action-icon" style={{ fontSize: '1.8rem' }}>{a.icon}</span>
                <span className="quick-action-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{a.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.05rem' }}>🔔 Recent Activity</h3>
            <a href="#" style={{ fontSize: '0.85rem', color: '#3b82f6' }}>View all</a>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1.05rem' }}>⚠️ Low Stock Alerts</h3>
            <a href="/admin/inventory" style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: 500 }}>View Inventory →</a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>Product</th>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>SKU</th>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>Category</th>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>Available</th>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>Min Stock</th>
                  <th style={{ fontSize: '0.8rem', letterSpacing: '0.06em', padding: '14px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontWeight: 700, fontSize: '0.925rem' }}>{p.name ?? p.productName}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ fontSize: '0.875rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>{p.sku}</code>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: catColors[p.category] || '#94a3b8', background: `${catColors[p.category] || '#94a3b8'}20`, padding: '3px 10px', borderRadius: 20 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ef4444' }}>{p.available}</span></td>
                    <td style={{ padding: '14px 16px' }}><span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>{p.minStock}</span></td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>⚠️ Low Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
