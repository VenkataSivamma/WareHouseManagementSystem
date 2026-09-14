import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/States'
import { SkeletonTable } from '../../components/common/Skeleton'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import { useToast } from '../../contexts/ToastContext'
import { formatDate, formatCurrency } from '../../utils/helpers'
import purchaseOrderService from '../../services/purchaseOrderService'
import supplierService from '../../services/supplierService'

const initForm = { supplierId: '', expectedDeliveryDate: '', notes: '' }

const PurchaseOrders = () => {
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [cancelItem, setCancelItem] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [form, setForm] = useState(initForm)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [ordRes, supRes] = await Promise.all([
        purchaseOrderService.getAll(),
        supplierService.getAll(),
      ])
      const orderData = ordRes.data
      const supplierData = supRes.data
      setOrders(Array.isArray(orderData) ? orderData : orderData?.content || [])
      setSuppliers(Array.isArray(supplierData) ? supplierData : supplierData?.content || [])
    } catch {
      toast.error('Error', 'Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    let data = orders
    if (search) data = data.filter(o =>
      o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(o => o.status === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, orders])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleAction = async (id, action) => {
    try {
      if (action === 'approved') await purchaseOrderService.approve(id)
      else if (action === 'rejected') await purchaseOrderService.reject(id, '')
      else if (action === 'completed') await purchaseOrderService.complete(id)
      else if (action === 'cancelled') await purchaseOrderService.cancel(id)
      toast.success('Updated!', `Order ${action}`)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Action failed')
    }
  }

  const openDetail = async (order) => {
    setViewItem(order)
    try {
      const res = await purchaseOrderService.getTimeline(order.id)
      setTimeline(Array.isArray(res.data) ? res.data : res.data?.content || [])
    } catch {
      setTimeline([])
    }
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!form.supplierId) { toast.error('Error', 'Please select a supplier'); return }
    setSaving(true)
    try {
      await purchaseOrderService.create(form)
      toast.success('Created!', 'Purchase order created')
      setModalOpen(false)
      setForm(initForm)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Purchase Orders' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Purchase Order Management</h1><p className="page-subtitle">{orders.length} total orders</p></div>
        <Button icon="+" onClick={() => setModalOpen(true)}>Create Order</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search orders..." />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['pending', 'approved', 'completed', 'rejected', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} results</span>
        </div>
        {loading ? <table><tbody><SkeletonTable rows={5} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="🛒" title="No Orders Found" action={() => setModalOpen(true)} actionLabel="Create Order" />
        ) : (
          <>
            <table>
              <thead><tr><th>Order No</th><th>Supplier</th><th>Items</th><th>Amount</th><th>Expected</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map(o => (
                  <tr key={o.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{o.orderNo}</strong></td>
                    <td>{o.supplierName}</td>
                    <td><span className="badge badge-secondary">{o.itemCount ?? (Array.isArray(o.items) ? o.items.length : Number(o.items) || 0)} items</span></td>
                    <td>{formatCurrency(o.totalAmount)}</td>
                    <td className="text-muted">{formatDate(o.expectedDeliveryDate)}</td>
                    <td><StatusBadge status={o.status} label={o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : 'Unknown'} /></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(o)}>👁️</Button>
                        {o.status === 'pending' && <>
                          <Button variant="success" size="sm" onClick={() => handleAction(o.id, 'approved')}>✅</Button>
                          <Button variant="danger" size="sm" onClick={() => handleAction(o.id, 'rejected')}>❌</Button>
                        </>}
                        {o.status === 'approved' && <Button variant="primary" size="sm" onClick={() => handleAction(o.id, 'completed')}>Complete</Button>}
                        {['pending', 'approved'].includes(o.status) && (
                          <Button variant="ghost" size="sm" onClick={() => { setCancelItem(o); setCancelOpen(true) }}>🗑️</Button>
                        )}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Purchase Order"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Create Order</Button></>}>
        <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} required
          options={suppliers.map(s => ({ value: String(s.id), label: s.companyName }))} placeholder="Select supplier..." />
        <Input label="Expected Delivery Date" name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={e => setForm(p => ({ ...p, expectedDeliveryDate: e.target.value }))} />
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-control" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Order notes..." />
        </div>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setTimeline([]) }} title="Order Details" size="lg">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16, background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{viewItem.orderNo}</h3>
                <p className="text-muted">{viewItem.supplierName}</p>
              </div>
              <StatusBadge status={viewItem.status} label={viewItem.status ? viewItem.status.charAt(0).toUpperCase() + viewItem.status.slice(1) : 'Unknown'} />
            </div>
            <div className="detail-grid" style={{ marginBottom: 20 }}>
              <div className="detail-item"><div className="detail-label">Total Amount</div><div className="detail-value">{formatCurrency(viewItem.totalAmount)}</div></div>
              <div className="detail-item"><div className="detail-label">Items</div><div className="detail-value">{viewItem.itemCount ?? viewItem.items ?? 0}</div></div>
              <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
              <div className="detail-item"><div className="detail-label">Expected</div><div className="detail-value">{formatDate(viewItem.expectedDeliveryDate)}</div></div>
            </div>
            {timeline.length > 0 && (
              <>
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Order Timeline</h4>
                <div className="timeline">
                  {timeline.map((t, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-time">{t.time || t.createdAt}</div>
                      <div className="timeline-content">{t.icon} {t.status || t.description}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={cancelOpen} onClose={() => setCancelOpen(false)}
        onConfirm={() => { handleAction(cancelItem?.id, 'cancelled'); setCancelOpen(false) }}
        title="Cancel Order" message={`Cancel order "${cancelItem?.orderNo}"?`} confirmText="Cancel Order" />
    </div>
  )
}

export default PurchaseOrders
