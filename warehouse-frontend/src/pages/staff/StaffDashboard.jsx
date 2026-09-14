import { useState, useEffect } from 'react'
import StatCard from '../../components/common/StatCard'
import ActivityFeed from '../../components/common/ActivityFeed'
import Breadcrumb from '../../components/common/Breadcrumb'
import { SkeletonStatCards } from '../../components/common/Skeleton'
import dashboardService from '../../services/dashboardService'

const priorityColors = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' }

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, tasksRes] = await Promise.all([
          dashboardService.getStaffStats(),
          dashboardService.getStaffTasks(),
        ])
        setStats(statsRes.data || [])
        setTasks(tasksRes.data?.tasks || [])
        setActivities(tasksRes.data?.activities || [])
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
      <Breadcrumb items={[{ label: 'Staff' }, { label: 'Dashboard' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Dashboard</h1>
          <p className="page-subtitle">Your tasks and activities for today</p>
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
            <h3 className="card-title">📋 Today's Tasks</h3>
            {tasks.length > 0 && (
              <span className="badge badge-warning">{tasks.filter(t => t.status === 'pending').length} pending</span>
            )}
          </div>
          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '12px 0' }}>No tasks for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: priorityColors[t.priority], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, textDecoration: t.status === 'completed' ? 'line-through' : 'none', color: t.status === 'completed' ? 'var(--text-secondary)' : 'var(--text)' }}>{t.task}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.time} • <span style={{ color: priorityColors[t.priority], fontWeight: 500 }}>{t.priority} priority</span></div>
                  </div>
                  <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions">
            {[
              { icon: '📥', label: 'Stock In', path: '/staff/stock-in' },
              { icon: '📤', label: 'Stock Out', path: '/staff/stock-out' },
              { icon: '🔍', label: 'Search Product', path: '/staff/product-search' },
              { icon: '🗄️', label: 'View Inventory', path: '/staff/inventory' },
            ].map((a, i) => (
              <a key={i} href={a.path} className="quick-action-btn">
                <span className="quick-action-icon">{a.icon}</span>
                <span className="quick-action-label">{a.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔔 Recent Activity</h3>
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}

export default StaffDashboard
