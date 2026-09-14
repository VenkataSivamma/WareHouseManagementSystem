const StatCard = ({ icon, label, title, value, change, changeType, variant = '' }) => (
  <div className={`stat-card${variant ? ` ${variant}` : ''}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className={`stat-value${String(value ?? '—').length > 8 ? ' stat-value-long' : ''}`}>{value ?? '—'}</div>
      <div className="stat-label">{label ?? title}</div>
      {change !== undefined && (
        <div className={`stat-change ${changeType || ''}`}>{change}</div>
      )}
    </div>
  </div>
)

export default StatCard
