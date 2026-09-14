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
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'
import supplierService from '../../services/supplierService'

const initForm = { name: '', sku: '', barcode: '', categoryId: '', supplierId: '', price: '', quantity: '', minStock: '', description: '', status: 'active' }

const Products = () => {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
      ])
      setProducts(prodRes.data?.content || prodRes.data || [])
      setCategories(catRes.data?.content || catRes.data || [])
      setSuppliers(supRes.data?.content || supRes.data || [])
    } catch {
      toast.error('Error', 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    let data = products
    if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) data = data.filter(p => String(p.categoryId) === catFilter || p.categoryName === catFilter)
    if (statusFilter) data = data.filter(p => p.status === statusFilter)
    setFiltered(data)
    setPage(1)
  }, [search, catFilter, statusFilter, products])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd = () => { setEditItem(null); setForm(initForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, categoryId: String(item.categoryId || ''), supplierId: String(item.supplierId || '') }); setErrors({}); setModalOpen(true) }
  const openView = (item) => { setViewItem(item); setDetailOpen(true) }
  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name) errs.name = 'Product name is required'
    if (!form.sku) errs.sku = 'SKU is required'
    if (!form.categoryId) errs.categoryId = 'Category is required'
    if (!form.price) errs.price = 'Price is required'
    if (!form.quantity) errs.quantity = 'Quantity is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v != null) fd.append(k, v) })
      if (editItem) {
        await productService.update(editItem.id, fd)
        toast.success('Updated!', 'Product updated successfully')
      } else {
        await productService.create(fd)
        toast.success('Created!', 'Product created successfully')
      }
      setModalOpen(false)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productService.delete(deleteItem.id)
      toast.success('Deleted!', 'Product deleted')
      setDeleteOpen(false)
      fetchAll()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Products' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <Button icon="+" onClick={openAdd}>Add Product</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search by name or SKU..." />
            <select className="form-control" style={{ width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <span className="text-sm text-muted">{filtered.length} results</span>
        </div>

        {loading ? <table><tbody><SkeletonTable rows={6} cols={8} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No Products Found" action={openAdd} actionLabel="Add Product" />
        ) : (
          <>
            <table>
              <thead>
                <tr><th>#</th><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="product-img">📦</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.supplierName}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                    <td>{p.categoryName}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>
                      <span style={{ color: (p.availableQuantity ?? p.quantity ?? 0) <= (p.minStock ?? 0) ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                        {p.availableQuantity ?? p.quantity ?? '—'}
                      </span>
                      {(p.availableQuantity ?? p.quantity ?? 0) <= (p.minStock ?? 0) && <span className="badge badge-danger" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Low</span>}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openView(p)}>👁️</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>✏️</Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(p)}>🗑️</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Product' : 'Add Product'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Create'}</Button></>}>
        <div className="form-row">
          <Input label="Product Name" name="name" value={form.name} onChange={handleChange} required error={errors.name} placeholder="Product name" />
          <Input label="SKU" name="sku" value={form.sku} onChange={handleChange} required error={errors.sku} placeholder="SKU-0001" />
        </div>
        <div className="form-row">
          <Input label="Barcode" name="barcode" value={form.barcode} onChange={handleChange} placeholder="Barcode number" />
          <Select label="Category" name="categoryId" value={form.categoryId} onChange={handleChange} required error={errors.categoryId}
            options={categories.map(c => ({ value: String(c.id), label: c.name }))} />
        </div>
        <div className="form-row">
          <Select label="Supplier" name="supplierId" value={form.supplierId} onChange={handleChange}
            options={suppliers.map(s => ({ value: String(s.id), label: s.companyName }))} />
          <Input label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} required error={errors.price} placeholder="0.00" />
        </div>
        <div className="form-row">
          <Input label="Available Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} required error={errors.quantity} placeholder="0" />
          <Input label="Minimum Stock" name="minStock" type="number" value={form.minStock} onChange={handleChange} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Product description..." />
        </div>
        <Select label="Status" name="status" value={form.status} onChange={handleChange}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Product Details" size="lg">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, background: 'var(--primary-light)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📦</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{viewItem.name}</h3>
                <p className="text-muted">{viewItem.categoryName} • {viewItem.supplierName}</p>
                <StatusBadge status={viewItem.status} />
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">SKU</div><div className="detail-value">{viewItem.sku}</div></div>
              <div className="detail-item"><div className="detail-label">Barcode</div><div className="detail-value">{viewItem.barcode || '—'}</div></div>
              <div className="detail-item"><div className="detail-label">Price</div><div className="detail-value">{formatCurrency(viewItem.price)}</div></div>
              <div className="detail-item"><div className="detail-label">Available Qty</div><div className="detail-value" style={{ color: (viewItem.availableQuantity ?? viewItem.quantity ?? 0) <= (viewItem.minStock ?? 0) ? 'var(--danger)' : 'var(--success)' }}>{viewItem.availableQuantity ?? viewItem.quantity ?? '—'}</div></div>
              <div className="detail-item"><div className="detail-label">Min Stock</div><div className="detail-value">{viewItem.minStock}</div></div>
              <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting}
        title="Delete Product" message={`Delete "${deleteItem?.name}"? This cannot be undone.`} />
    </div>
  )
}

export default Products
