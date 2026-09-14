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
import purchaseOrderService from '../../services/purchaseOrderService'

const statusOptions = ['', 'pending', 'approved', 'accepted', 'in_transit', 'completed', 'rejected']

const SupplierOrders = () => {
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewOrder, setViewOrder] = useState(null)
  const [accepting, setAccepting] = useState(false)
  const pageSize = 6

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await purchaseOrderService.getBySupplier()
      const raw = res.data?.content || res.data || []
      // Normalize: flatten first item fields for display
      const normalized = raw.map(o => ({
        ...o,
        orderNo: o.orderNumber ?? o.orderNo,
        productName: o.items?.[0]?.productName ?? o.productName,
        sku: o.items?.[0]?.sku ?? o.sku,
        quantity: o.items?.[0]?.quantity ?? o.quantity,
        expectedDate: o.expectedDeliveryDate ?? o.expectedDate,
      }))
      setOrders(normalized)
    } catch {
      toast.error('Error', 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    let data = orders
    if (search) data = data.filter(o =>
      o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
      o.productName?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(o => o.status === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, orders])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleAccept = async (order) => {
    setAccepting(true)
    try {
      await purchaseOrderService.acceptOrder(order.id)
      toast.success('Accepted!', `Order ${order.orderNo} has been accepted.`)
      setViewOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Accept failed')
    } finally {
      setAccepting(false)
    }
  }

  const fmtStatus = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div>
      <Breadcrumb items={[{ label: 'Supplier', path: '/supplier/dashboard' }, { label: 'Purchase Orders' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">View and manage your assigned purchase orders</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by order ID or product..." />
            <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {statusOptions.map(s => <option key={s} value={s}>{s ? fmtStatus(s) : 'All Status'}</option>)}
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} orders</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={6} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No Orders Found" />
        ) : (
          <>
            <table>
              <thead>
                <tr><th>#</th><th>Order ID</th><th>Product</th><th>Qty</th><th>Amount</th><th>Delivery Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {paginated.map((o, i) => (
                  <tr key={o.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td><strong>{o.orderNo}</strong></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.sku}</div>
                    </td>
                    <td>{o.quantity} {o.unit}</td>
                    <td>{formatCurrency(o.totalAmount)}</td>
                    <td>{formatDate(o.expectedDate)}</td>
                    <td><StatusBadge status={o.status} label={fmtStatus(o.status)} /></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setViewOrder(o)}>👁️ View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details">
        {viewOrder && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{viewOrder.orderNo}</h3>
                <p className="text-muted text-sm">{viewOrder.productName} • {viewOrder.sku}</p>
              </div>
              <StatusBadge status={viewOrder.status} label={fmtStatus(viewOrder.status)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Quantity', value: `${viewOrder.quantity} ${viewOrder.unit ?? ''}` },
                { label: 'Amount', value: formatCurrency(viewOrder.totalAmount) },
                { label: 'Ordered On', value: formatDate(viewOrder.createdAt) },
                { label: 'Delivery Date', value: formatDate(viewOrder.expectedDate) },
              ].map((s, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>
            {viewOrder.notes && (
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: '0.875rem' }}>{viewOrder.notes}</div>
              </div>
            )}
            {viewOrder.status === 'approved' && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleAccept(viewOrder)} disabled={accepting}>
                {accepting ? 'Accepting...' : '✅ Accept Order'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SupplierOrders
