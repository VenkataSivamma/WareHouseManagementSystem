const BarChart = ({ data = [], title, subtitle }) => {
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 1)
  return (
    <div className="chart-container">
      <div className="card-header">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
        </div>
      </div>
      <div className="chart-bars">
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, justifyContent: 'flex-end', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: '100%', width: '100%', justifyContent: 'center' }}>
              <div className="chart-bar" style={{ height: `${(d.value / max) * 100}%`, flex: 1 }} title={`${d.label}: ${d.value}`} />
              {d.value2 !== undefined && (
                <div className="chart-bar secondary" style={{ height: `${(d.value2 / max) * 100}%`, flex: 1 }} title={`${d.label}: ${d.value2}`} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="chart-labels">
        {data.map((d, i) => <span key={i} className="chart-label">{d.label}</span>)}
      </div>
      <div className="chart-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--primary)' }} /><span>Stock In</span></div>
        {data[0]?.value2 !== undefined && <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--info)' }} /><span>Stock Out</span></div>}
      </div>
    </div>
  )
}

const DonutChart = ({ data = [], title }) => {
  const total = data.reduce((s, d) => s + d.value, 0)
  const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--info)']
  let offset = 0
  const radius = 60, cx = 80, cy = 80, circumference = 2 * Math.PI * radius

  return (
    <div className="chart-container">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((d, i) => {
            const pct = d.value / total
            const dash = pct * circumference
            const gap = circumference - dash
            const rotation = offset * 360 - 90
            offset += pct
            return (
              <circle key={i} cx={cx} cy={cy} r={radius}
                fill="none" stroke={colors[i % colors.length]} strokeWidth="28"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={0}
                transform={`rotate(${rotation} ${cx} ${cy})`}
              />
            )
          })}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="var(--text)">{total}</text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Total</text>
        </svg>
        <div className="chart-legend" style={{ flexDirection: 'column' }}>
          {data.map((d, i) => (
            <div key={i} className="legend-item">
              <div className="legend-dot" style={{ background: colors[i % colors.length] }} />
              <span>{d.label}: <strong>{d.value}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { BarChart, DonutChart }
