import { formatDateTime } from '../../utils/helpers'

const ActivityFeed = ({ activities = [] }) => {
  if (!activities.length) return (
    <div className="empty-state" style={{ padding: '30px 0' }}>
      <div className="empty-state-icon">📋</div>
      <p className="empty-state-desc">No recent activities</p>
    </div>
  )
  return (
    <div className="activity-list">
      {activities.map((a, i) => (
        <div key={i} className="activity-item">
          <div className={`activity-icon${a.type ? ` ${a.type}` : ''}`}>{a.icon || '📌'}</div>
          <div className="activity-content">
            <p className="activity-text">{a.text}</p>
            <p className="activity-time">{formatDateTime(a.time)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityFeed
