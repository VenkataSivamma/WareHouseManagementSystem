import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/States'
import { SkeletonTable } from '../../components/common/Skeleton'
import { useToast } from '../../contexts/ToastContext'
import { formatDate } from '../../utils/helpers'
import inventoryService from '../../services/inventoryService'

const tabs = ['All', 'Pending', 'Approved', 'Rejected']

const StockApprovals = () => {
  const { toast } = useToast()
  const [approvals, setApprovals] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [viewItem, setViewItem] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectItem, setRejectItem] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const pageSize = 6

  const fetchApprovals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryService.getMovements()
      setApprovals(res.data?.content || res.data || [])
    } catch {
      toast.error('Error', 'Failed to load stock approvals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApprovals() }, [fetchApprovals])

  useEffect(() => {
    let data = approvals
    if (activeTab !== 'All') data = data.filter(a => a.status === activeTab.toLowerCase())
    if (search) data = data.filter(a =>
      (a.productName ?? a.product)?.toLowerCase().includes(search.toLowerCase()) ||
      (a.performedBy ?? a.staffName)?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(data); setPage(1)
  }, [activeTab, search, approvals])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pendingCount = approvals.filter(a => a.status === 'pending').length

  const handleApprove = async (item) => {
    try {
      if (item.type === 'Stock In') await inventoryService.approveStockIn(item.id)
      else await inventoryService.approveStockOut(item.id)
      toast.success('Approved!', 'Stock movement approved successfully')
      fetchApprovals()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Approval failed')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Required', 'Please enter a rejection reason'); return }
    try {
      await inventoryService.rejectStock(rejectItem.id, rejectReason)
      toast.success('Rejected', 'Stock movement rejected')
      setRejectOpen(false); setRejectReason('')
      fetchApprovals()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Rejection failed')
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Manager', path: '/manager/dashboard' }, { label: 'Stock Approvals' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Approvals</h1>
          <p className="page-subtitle">{pendingCount} pending approvals</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: '0.875rem', color: 'var(--warning)', fontWeight: 500 }}>
            ⚠️ {pendingCount} items awaiting your approval
          </div>
        )}
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {tab === 'Pending' && pendingCount > 0 && <span className="badge badge-danger" style={{ marginLeft: 6 }}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by product or staff..." />
          </div>
          <span className="text-sm text-muted">{filtered.length} records</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={6} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="✅" title="No Records Found" description="No stock movements match your filter." />
        ) : (
          <>
            <table>
              <thead>
                <tr><th>Type</th><th>Product</th><th>Qty</th><th>Staff</th><th>Remarks</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id}>
                    <td>
                      <span className={`badge ${a.type === 'Stock In' ? 'badge-success' : 'badge-danger'}`}>
                        {a.type === 'Stock In' ? '📥' : '📤'} {a.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.productName ?? a.product}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.sku}</div>
                    </td>
                    <td><strong>{a.quantity}</strong> units</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.performedBy ?? a.staffName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.staffId}</div>
                    </td>
                    <td className="text-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason ?? a.remarks}</td>
                    <td className="text-muted">{formatDate(a.createdAt)}</td>
                    <td><StatusBadge status={a.status} label={a.status.charAt(0).toUpperCase() + a.status.slice(1)} /></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => setViewItem(a)}>👁️</Button>
                        {a.status === 'pending' && <>
                          <Button variant="success" size="sm" onClick={() => handleApprove(a)}>✅ Approve</Button>
                          <Button variant="danger" size="sm" onClick={() => { setRejectItem(a); setRejectOpen(true) }}>❌ Reject</Button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Stock Movement Details">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16, background: viewItem.type === 'Stock In' ? 'var(--success-light)' : 'var(--danger-light)', borderRadius: 'var(--radius)' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>{viewItem.type}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{viewItem.productName ?? viewItem.product}</p>
              </div>
              <StatusBadge status={viewItem.status} label={viewItem.status.charAt(0).toUpperCase() + viewItem.status.slice(1)} />
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{viewItem.productName ?? viewItem.product}</div></div>
              <div className="detail-item"><div className="detail-label">SKU</div><div className="detail-value">{viewItem.sku}</div></div>
              <div className="detail-item"><div className="detail-label">Quantity</div><div className="detail-value">{viewItem.quantity} units</div></div>
              <div className="detail-item"><div className="detail-label">Staff</div><div className="detail-value">{viewItem.performedBy ?? viewItem.staffName}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
              <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Remarks</div><div className="detail-value">{viewItem.reason ?? viewItem.remarks ?? '—'}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Stock Movement" size="sm"
        footer={<><Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant="danger" onClick={handleReject}>Reject</Button></>}>
        <p style={{ marginBottom: 12, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Rejecting: <strong>{rejectItem?.productName ?? rejectItem?.product}</strong> — {rejectItem?.quantity} units
        </p>
        <div className="form-group">
          <label className="form-label">Rejection Reason <span className="required">*</span></label>
          <textarea className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..." rows={3} />
        </div>
      </Modal>
    </div>
  )
}

export default StockApprovals
