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
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useToast } from '../../contexts/ToastContext'
import { formatDate, formatCurrency } from '../../utils/helpers'
import purchaseOrderService from '../../services/purchaseOrderService'
import productService from '../../services/productService'
import supplierService from '../../services/supplierService'

const initForm = { productId: '', supplierId: '', quantity: '', estimatedCost: '', notes: '' }

const PurchaseRequests = () => {
  const { toast } = useToast()
  const [requests, setRequests] = useState([])
  const [filtered, setFiltered] = useState([])
  const [products, setProducts] = useState([])
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
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [cancelItem, setCancelItem] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [reqRes, prodRes, supRes] = await Promise.all([
        purchaseOrderService.getAll(),
        productService.getAll(),
        supplierService.getAll(),
      ])
      const rawRequests = reqRes.data?.content || reqRes.data || []
      setRequests(rawRequests.map(request => {
        const item = request.items?.[0]
        return {
          ...request,
          orderNo: request.orderNumber ?? request.orderNo,
          productId: request.productId ?? item?.productId,
          productName: request.productName ?? item?.productName,
          sku: request.sku ?? item?.sku,
          quantity: request.quantity ?? item?.quantity,
          estimatedCost: request.estimatedCost ?? item?.unitPrice,
        }
      }))
      setProducts(prodRes.data?.content || prodRes.data || [])
      setSuppliers(supRes.data?.content || supRes.data || [])
    } catch {
      toast.error('Error', 'Failed to load purchase requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    let data = requests
    if (search) data = data.filter(r =>
      r.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
      r.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.supplierName?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(r => r.status === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, requests])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd = () => { setEditItem(null); setForm(initForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => {
    if (item.status !== 'pending') { toast.warning('Cannot Edit', 'Only pending requests can be edited'); return }
    setEditItem(item); setForm({ productId: String(item.productId || ''), supplierId: String(item.supplierId || ''), quantity: item.quantity, estimatedCost: item.estimatedCost, notes: item.notes || '' }); setErrors({}); setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.productId) errs.productId = 'Product is required'
    if (!form.supplierId) errs.supplierId = 'Supplier is required'
    if (!form.quantity || form.quantity <= 0) errs.quantity = 'Valid quantity is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editItem) {
        await purchaseOrderService.updateSimple(editItem.id, form)
        toast.success('Updated!', 'Purchase request updated')
      } else {
        await purchaseOrderService.createSimple(form)
        toast.success('Created!', 'Purchase request submitted')
      }
      setModalOpen(false)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    try {
      await purchaseOrderService.cancel(cancelItem.id)
      toast.success('Cancelled', 'Purchase request cancelled')
      setCancelOpen(false)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Manager', path: '/manager/dashboard' }, { label: 'Purchase Requests' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Purchase Requests</h1><p className="page-subtitle">{requests.length} total requests</p></div>
        <Button icon="+" onClick={openAdd}>New Request</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search requests..." />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {['pending', 'approved', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} results</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={5} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="🛒" title="No Purchase Requests" action={openAdd} actionLabel="New Request" />
        ) : (
          <>
            <table>
              <thead><tr><th>Request No</th><th>Product</th><th>Supplier</th><th>Qty</th><th>Est. Cost</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map(r => (
                  <tr key={r.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{r.orderNo}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.sku}</div>
                    </td>
                    <td>{r.supplierName}</td>
                    <td><span className="badge badge-secondary">{r.quantity} units</span></td>
                    <td>{formatCurrency(r.estimatedCost ?? r.totalAmount)}</td>
                    <td><StatusBadge status={r.status} label={r.status.charAt(0).toUpperCase() + r.status.slice(1)} /></td>
                    <td className="text-muted">{formatDate(r.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => { setViewItem(r); setDetailOpen(true) }}>👁️</Button>
                        {r.status === 'pending' && <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>✏️</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setCancelItem(r); setCancelOpen(true) }}>🗑️</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Request' : 'New Purchase Request'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Submit'}</Button></>}>
        <div className="form-row">
          <Select label="Product" name="productId" value={form.productId} onChange={handleChange} required error={errors.productId}
            options={products.map(p => ({ value: String(p.id), label: p.name }))} />
          <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange} required error={errors.supplierId}
            options={suppliers.map(s => ({ value: String(s.id), label: s.companyName }))} />
        </div>
        <div className="form-row">
          <Input label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required error={errors.quantity} placeholder="0" />
          <Input label="Estimated Cost (₹)" name="estimatedCost" type="number" value={form.estimatedCost} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="form-control" placeholder="Additional notes..." />
        </div>
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Request Details">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: 16, background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
              <div>
                <h3 style={{ fontWeight: 700 }}>{viewItem.orderNo}</h3>
                <p className="text-muted text-sm">{viewItem.productName}</p>
              </div>
              <StatusBadge status={viewItem.status} label={viewItem.status.charAt(0).toUpperCase() + viewItem.status.slice(1)} />
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{viewItem.productName}</div></div>
              <div className="detail-item"><div className="detail-label">SKU</div><div className="detail-value">{viewItem.sku}</div></div>
              <div className="detail-item"><div className="detail-label">Supplier</div><div className="detail-value">{viewItem.supplierName}</div></div>
              <div className="detail-item"><div className="detail-label">Quantity</div><div className="detail-value">{viewItem.quantity} units</div></div>
              <div className="detail-item"><div className="detail-label">Estimated Cost</div><div className="detail-value">{formatCurrency(viewItem.estimatedCost ?? viewItem.totalAmount)}</div></div>
              <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
              {viewItem.notes && <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Notes</div><div className="detail-value">{viewItem.notes}</div></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel}
        title="Cancel Request" message={`Cancel request "${cancelItem?.orderNo}"?`} confirmText="Cancel Request" />
    </div>
  )
}

export default PurchaseRequests
