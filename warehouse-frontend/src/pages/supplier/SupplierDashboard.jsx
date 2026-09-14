import { useState, useEffect } from 'react'
import StatCard from '../../components/common/StatCard'
import ActivityFeed from '../../components/common/ActivityFeed'
import Breadcrumb from '../../components/common/Breadcrumb'
import { SkeletonStatCards } from '../../components/common/Skeleton'
import dashboardService from '../../services/dashboardService'
import { formatDate } from '../../utils/helpers'

const SupplierDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [orders, setOrders] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, ordersRes] = await Promise.all([
          dashboardService.getSupplierStats(),
          dashboardService.getSupplierOrders(),
        ])
        setStats(statsRes.data || [])
        setOrders(ordersRes.data?.orders || [])
        setActivities(ordersRes.data?.activities || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div>
      <Breadcrumb items={[{ label: 'Supplier' }, { label: 'Dashboard' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Dashboard</h1>
          <p className="page-subtitle">Your delivery and order performance summary</p>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--white)', padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {loading ? <SkeletonStatCards count={4} /> : (
        <div className="stat-cards">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📦 Recent Orders</h3>
            <span className="badge badge-info">Live</span>
          </div>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '12px 0' }}>No recent orders.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {orders.map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{order.orderNumber ?? order.orderNo}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.productName} • {order.quantity} units</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`badge ${order.status === 'approved' ? 'badge-success' : order.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>{order.status}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{order.eta ?? formatDate(order.expectedDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔔 Activity</h3>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard
