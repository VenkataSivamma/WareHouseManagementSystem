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
import { formatDate } from '../../utils/helpers'
import supplierService from '../../services/supplierService'

const initForm = { companyName: '', contactPerson: '', gstNumber: '', email: '', phone: '', companyAddress: '', status: 'active' }

const Suppliers = () => {
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supplierService.getAll()
      const data = res.data?.content || res.data || []
      setSuppliers(data)
    } catch {
      toast.error('Error', 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  useEffect(() => {
    let data = suppliers
    if (search) data = data.filter(s =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(data); setPage(1)
  }, [search, suppliers])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openAdd = () => { setEditItem(null); setForm(initForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setErrors({}); setModalOpen(true) }
  const openView = (item) => { setViewItem(item); setDetailOpen(true) }
  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.companyName) errs.companyName = 'Company name is required'
    if (!form.email) errs.email = 'Email is required'
    if (!form.phone) errs.phone = 'Phone is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editItem) {
        await supplierService.update(editItem.id, form)
        toast.success('Updated!', 'Supplier updated successfully')
      } else {
        await supplierService.create(form)
        toast.success('Created!', 'Supplier added successfully')
      }
      setModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await supplierService.delete(deleteItem.id)
      toast.success('Deleted!', 'Supplier removed')
      setDeleteOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      await supplierService.toggleStatus(item.id)
      toast.success('Updated!', `Supplier ${item.status === 'active' ? 'deactivated' : 'activated'}`)
      fetchSuppliers()
    } catch {
      toast.error('Error', 'Status update failed')
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Suppliers' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Supplier Management</h1><p className="page-subtitle">{suppliers.length} registered suppliers</p></div>
        <Button icon="+" onClick={openAdd}>Add Supplier</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search suppliers..." />
          </div>
          <span className="text-sm text-muted">{filtered.length} results</span>
        </div>
        {loading ? <table><tbody><SkeletonTable rows={5} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="🏢" title="No Suppliers Found" action={openAdd} actionLabel="Add Supplier" />
        ) : (
          <>
            <table>
              <thead><tr><th>#</th><th>Company</th><th>Contact Person</th><th>GST Number</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.companyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.email}</div>
                    </td>
                    <td>{s.contactPerson}</td>
                    <td><code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{s.gstNumber}</code></td>
                    <td>{s.phone}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openView(s)}>👁️</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>✏️</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(s)}>{s.status === 'active' ? '🔴' : '🟢'}</Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(s)}>🗑️</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add Supplier'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Add'}</Button></>}>
        <div className="form-row">
          <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required error={errors.companyName} placeholder="Company name" />
          <Input label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Contact person name" />
        </div>
        <div className="form-row">
          <Input label="GST Number" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required error={errors.phone} placeholder="9876543210" />
        </div>
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required error={errors.email} placeholder="contact@company.com" />
        <div className="form-group">
          <label className="form-label">Company Address</label>
          <textarea name="companyAddress" value={form.companyAddress} onChange={handleChange} className="form-control" placeholder="Full address..." />
        </div>
        <Select label="Status" name="status" value={form.status} onChange={handleChange}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Supplier Profile">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
              <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
                {viewItem.companyName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontWeight: 700 }}>{viewItem.companyName}</h3>
                <p className="text-muted text-sm">{viewItem.email}</p>
                <StatusBadge status={viewItem.status} />
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Contact Person</div><div className="detail-value">{viewItem.contactPerson}</div></div>
              <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{viewItem.phone}</div></div>
              <div className="detail-item"><div className="detail-label">GST Number</div><div className="detail-value">{viewItem.gstNumber}</div></div>
              <div className="detail-item"><div className="detail-label">Registered</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
              <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Address</div><div className="detail-value">{viewItem.companyAddress}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting}
        title="Remove Supplier" message={`Remove "${deleteItem?.companyName}"? This cannot be undone.`} />
    </div>
  )
}

export default Suppliers
