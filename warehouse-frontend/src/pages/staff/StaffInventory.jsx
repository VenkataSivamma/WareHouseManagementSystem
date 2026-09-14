import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { EmptyState } from '../../components/common/States'
import { SkeletonTable } from '../../components/common/Skeleton'
import { formatDate } from '../../utils/helpers'
import { useToast } from '../../contexts/ToastContext'
import inventoryService from '../../services/inventoryService'

const StaffInventory = () => {
  const { toast } = useToast()
  const [inventory, setInventory] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [viewItem, setViewItem] = useState(null)
  const pageSize = 6

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryService.getAvailable()
      setInventory(res.data?.content || res.data || [])
    } catch {
      toast.error('Error', 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  useEffect(() => {
    let data = inventory
    if (search) data = data.filter(i =>
      (i.productName ?? i.product)?.toLowerCase().includes(search.toLowerCase()) ||
      i.sku?.toLowerCase().includes(search.toLowerCase())
    )
    if (statusFilter) data = data.filter(i => i.status === statusFilter)
    setFiltered(data); setPage(1)
  }, [search, statusFilter, inventory])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Staff', path: '/staff/dashboard' }, { label: 'Inventory' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Inventory</h1><p className="page-subtitle">View current stock levels</p></div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search products..." />
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="low">Low Stock</option>
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} items</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={6} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="🗄️" title="No Records Found" />
        ) : (
          <>
            <table>
              <thead><tr><th>#</th><th>Product</th><th>SKU</th><th>Category</th><th>Available</th><th>Reserved</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {paginated.map((item, i) => {
                  const avail = item.availableQuantity ?? item.available ?? 0
                  const reserved = item.reservedQuantity ?? item.reserved ?? 0
                  return (
                    <tr key={item.id}>
                      <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                      <td><strong>{item.productName ?? item.product}</strong></td>
                      <td><code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{item.sku}</code></td>
                      <td>{item.categoryName}</td>
                      <td><strong style={{ color: avail <= (item.minStock ?? 0) ? 'var(--danger)' : 'var(--success)' }}>{avail}</strong></td>
                      <td>{reserved}</td>
                      <td><StatusBadge status={item.status} label={item.status === 'low' ? 'Low Stock' : 'Available'} /></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => setViewItem(item)}>👁️ View</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} total={filtered.length} pageSize={pageSize} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Product Details">
        {viewItem && (() => {
          const avail = viewItem.availableQuantity ?? viewItem.available ?? 0
          const reserved = viewItem.reservedQuantity ?? viewItem.reserved ?? 0
          return (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{viewItem.productName ?? viewItem.product}</h3>
              <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{viewItem.sku} • {viewItem.categoryName}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Available', value: avail, color: avail <= (viewItem.minStock ?? 0) ? 'var(--danger)' : 'var(--success)' },
                  { label: 'Reserved', value: reserved, color: 'var(--info)' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="detail-grid">
                <div className="detail-item"><div className="detail-label">Min Stock</div><div className="detail-value">{viewItem.minStock ?? '—'}</div></div>
                <div className="detail-item"><div className="detail-label">Last Updated</div><div className="detail-value">{formatDate(viewItem.lastUpdated ?? viewItem.updatedAt)}</div></div>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

export default StaffInventory
