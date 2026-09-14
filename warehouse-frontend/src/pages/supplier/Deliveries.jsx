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

const Deliveries = () => {
  const { toast } = useToast()
  const [deliveries, setDeliveries] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewItem, setViewItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notesInput, setNotesInput] = useState('')
  const pageSize = 6

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await deliveryService.getBySupplier()
      setDeliveries(res.data?.content || res.data || [])
    } catch {
      toast.error('Error', 'Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  useEffect(() => {
    let data = deliveries
    if (search) data = data.filter(d =>
      d.deliveryNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.orderNumber?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(d => d.status?.toLowerCase() === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, deliveries])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleMarkInTransit = async (item) => {
    setActionLoading(true)
    try {
      await deliveryService.updateStatus(item.id, 'in_transit')
      toast.success('Updated!', `Delivery is now in transit.`)
      setViewItem(null)
      fetchDeliveries()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Update failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkDelivered = async () => {
    setActionLoading(true)
    try {
      await deliveryService.markDelivered(viewItem.id, { notes: notesInput })
      toast.success('Delivered!', `Delivery marked as delivered.`)
      setViewItem(null); setNotesInput('')
      fetchDeliveries()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Update failed')
    } finally {
      setActionLoading(false)
    }
  }

  const fmtStatus = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div>
      <Breadcrumb items={[{ label: 'Supplier', path: '/supplier/dashboard' }, { label: 'Deliveries' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-subtitle">Manage and update your active deliveries</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by delivery ID, order or product..." />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} deliveries</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={5} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="🚚" title="No Deliveries Found" />
        ) : (
          <>
            <table>
              <thead>
                <tr><th>#</th><th>Delivery No.</th><th>Order No.</th><th>Supplier</th><th>Amount</th><th>Scheduled</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {paginated.map((d, i) => (
                  <tr key={d.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td><strong>{d.deliveryNumber}</strong></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.orderNumber}</td>
                    <td>{d.supplierName}</td>
                    <td>{formatCurrency(d.totalAmount)}</td>
                    <td>{formatDate(d.scheduledDate)}</td>
                    <td><StatusBadge status={d.status} label={fmtStatus(d.status)} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => { setViewItem(d); setNotesInput(d.notes || '') }}>👁️ View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => { setViewItem(null); setNotesInput('') }} title="Delivery Details">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{viewItem.deliveryNumber}</h3>
                <p className="text-muted text-sm">Order: {viewItem.orderNumber}</p>
              </div>
              <StatusBadge status={viewItem.status} label={fmtStatus(viewItem.status)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Supplier', value: viewItem.supplierName },
                { label: 'Total Amount', value: formatCurrency(viewItem.totalAmount) },
                { label: 'Scheduled Date', value: formatDate(viewItem.scheduledDate) },
                { label: 'Delivered Date', value: formatDate(viewItem.deliveredDate) || '—' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {viewItem.status !== 'delivered' && (
              <div className="form-group">
                <label className="form-label">Delivery Notes</label>
                <textarea className="form-control" rows={2} value={notesInput} onChange={e => setNotesInput(e.target.value)} placeholder="Add notes (optional)" />
              </div>
            )}

            {viewItem.status === 'pending' && (
              <button className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }} onClick={() => handleMarkInTransit(viewItem)} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : '🚚 Mark as In Transit'}
              </button>
            )}
            {viewItem.status === 'in_transit' && (
              <button className="btn btn-success" style={{ width: '100%' }} onClick={handleMarkDelivered} disabled={actionLoading}>
                {actionLoading ? 'Updating...' : '✅ Mark as Delivered'}
              </button>
            )}
            {viewItem.status === 'delivered' && viewItem.notes && (
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

export default Deliveries
