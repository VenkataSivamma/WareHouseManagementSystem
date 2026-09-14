const Pagination = ({ page, totalPages, total, pageSize, onPageChange }) => {
  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) pages.push(i)

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} records
      </span>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => onPageChange(1)} disabled={page === 1}>«</button>
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
        {pages[0] > 1 && <><button className="page-btn" onClick={() => onPageChange(1)}>1</button>{pages[0] > 2 && <span style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>…</span>}</>}
        {pages.map(p => (
          <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        {pages[pages.length - 1] < totalPages && <>{pages[pages.length - 1] < totalPages - 1 && <span style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>…</span>}<button className="page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
        <button className="page-btn" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</button>
      </div>
    </div>
  )
}

export default Pagination
