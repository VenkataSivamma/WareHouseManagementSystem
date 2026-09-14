const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i}><div className="skeleton skeleton-text" /></td>
    ))}
  </tr>
)

const SkeletonCard = () => (
  <div className="card">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-text" />
    <div className="skeleton skeleton-text" style={{ width: '80%' }} />
    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
  </div>
)

const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
  </>
)

const SkeletonStatCards = ({ count = 4 }) => (
  <div className="stat-cards">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="stat-card">
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--radius)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-title" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        </div>
      </div>
    ))}
  </div>
)

export { SkeletonRow, SkeletonCard, SkeletonTable, SkeletonStatCards }
