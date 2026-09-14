import { useState, useEffect } from 'react'
import StatCard from '../../components/common/StatCard'
import { BarChart } from '../../components/common/Charts'
import ActivityFeed from '../../components/common/ActivityFeed'
import Breadcrumb from '../../components/common/Breadcrumb'
import { SkeletonStatCards } from '../../components/common/Skeleton'
import dashboardService from '../../services/dashboardService'

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [barData, setBarData] = useState([])
  const [activities, setActivities] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, chartsRes, actRes] = await Promise.all([
          dashboardService.getManagerStats(),
          dashboardService.getManagerCharts(),
          dashboardService.getManagerActivities(),
        ])
        setStats(statsRes.data || [])
        setBarData(chartsRes.data?.stockMovement || [])
        setActivities(actRes.data?.activities || [])
        setPendingApprovals(actRes.data?.pendingApprovals || [])
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
      <Breadcrumb items={[{ label: 'Manager' }, { label: 'Dashboard' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Dashboard</h1>
          <p className="page-subtitle">Warehouse operations overview for today</p>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--white)', padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {loading ? <SkeletonStatCards count={6} /> : (
        <div className="stat-cards">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      <div className="grid-2 mb-24">
        {barData.length > 0 && (
          <BarChart title="Weekly Stock Movement" subtitle="Stock In vs Stock Out this week" data={barData} />
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏳ Pending Approvals</h3>
            <a href="/manager/stock-approvals" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View All</a>
          </div>
          {pendingApprovals.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '12px 0' }}>No pending approvals.</p>
          ) : pendingApprovals.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.type === 'STOCK_IN' ? 'var(--success-light)' : 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  {a.type === 'STOCK_IN' ? '📥' : '📤'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.product}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.type === 'STOCK_IN' ? 'Stock In' : 'Stock Out'} • {a.quantity} units • {a.requestedBy ?? a.staffName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <a href="/manager/stock-approvals" className="btn btn-success btn-sm">✅</a>
                <a href="/manager/stock-approvals" className="btn btn-danger btn-sm">❌</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔔 Recent Activity</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Today</span>
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}

export default ManagerDashboard
