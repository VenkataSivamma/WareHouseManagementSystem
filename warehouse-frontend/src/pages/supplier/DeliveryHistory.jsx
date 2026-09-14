import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import SearchBar from '../../components/common/SearchBar'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import { EmptyState } from '../../components/common/States'
import { SkeletonTable } from '../../components/common/Skeleton'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { useToast } from '../../contexts/ToastContext'
import deliveryService from '../../services/deliveryService'

const DeliveryHistory = () => {
  const { toast } = useToast()
  const [history, setHistory] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewItem, setViewItem] = useState(null)
  const pageSize = 6

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await deliveryService.getHistory()
      setHistory(res.data?.content || res.data || [])
    } catch {
      toast.error('Error', 'Failed to load delivery history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  useEffect(() => {
    let data = history
    if (search) data = data.filter(d =>
      d.deliveryNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.orderNumber?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(d => d.status?.toLowerCase() === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, history])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalDelivered = history.filter(d => d.status?.toLowerCase() === 'delivered').length
  const totalRejected = history.filter(d => d.status?.toLowerCase() === 'rejected').length
  const totalAmount = history.filter(d => d.status?.toLowerCase() === 'delivered').reduce((s, d) => s + (d.totalAmount ?? 0), 0)
  const onTimeRate = history.length > 0 ? Math.round((totalDelivered / history.length) * 100) : 0

  return (
    <div>
      <Breadcrumb items={[{ label: 'Supplier', path: '/supplier/dashboard' }, { label: 'Delivery History' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery History</h1>
          <p className="page-subtitle">Past delivery records and performance</p>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 24 }}>
        {[
          { icon: '✅', label: 'Total Delivered', value: totalDelivered, variant: 'success' },
          { icon: '❌', label: 'Rejected', value: totalRejected, variant: 'danger' },
          { icon: '💰', label: 'Total Value Delivered', value: formatCurrency(totalAmount), variant: 'info' },
          { icon: '📈', label: 'On-Time Rate', value: `${onTimeRate}%`, variant: 'warning' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.variant}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by ID, order or product..." />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} records</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={6} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="📋" title="No History Found" />
        ) : (
          <>
            <table>
              <thead>
                <tr><th>#</th><th>Delivery No.</th><th>Order No.</th><th>Supplier</th><th>Amount</th><th>Delivered On</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => (
                  <tr key={d.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td><strong>{d.deliveryNumber}</strong></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.orderNumber}</td>
                    <td>{d.supplierName}</td>
                    <td>{formatCurrency(d.totalAmount)}</td>
                    <td>{formatDate(d.deliveredDate)}</td>
                    <td><StatusBadge status={d.status} label={d.status.replace(/\b\w/g, c => c.toUpperCase())} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setViewItem(d)}>👁️ View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Delivery Record">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{viewItem.deliveryNumber}</h3>
                <p className="text-muted text-sm">Order: {viewItem.orderNumber}</p>
              </div>
              <StatusBadge status={viewItem.status} label={viewItem.status.replace(/\b\w/g, c => c.toUpperCase())} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Supplier', value: viewItem.supplierName },
                { label: 'Total Amount', value: formatCurrency(viewItem.totalAmount) },
                { label: 'Scheduled Date', value: formatDate(viewItem.scheduledDate) },
                { label: 'Delivered On', value: formatDate(viewItem.deliveredDate) || '—' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>
            {viewItem.notes && (
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: '0.875rem' }}>{viewItem.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DeliveryHistory
