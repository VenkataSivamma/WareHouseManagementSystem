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
import Avatar from '../../components/common/Avatar'
import { useToast } from '../../contexts/ToastContext'
import { formatDate } from '../../utils/helpers'
import { DEPARTMENTS, WAREHOUSE_LOCATIONS } from '../../utils/constants'
import managerService from '../../services/managerService'

const initForm = { fullName: '', employeeId: '', email: '', phone: '', password: '', department: '', warehouseLocation: '', status: 'active' }

const Managers = () => {
  const { toast } = useToast()
  const [managers, setManagers] = useState([])
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

  const fetchManagers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await managerService.getAll()
      const data = res.data?.content || res.data || []
      setManagers(data)
    } catch {
      toast.error('Error', 'Failed to load managers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchManagers() }, [fetchManagers])

  useEffect(() => {
    let data = managers
    if (search) data = data.filter(m =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(data); setPage(1)
  }, [search, managers])

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
    if (!form.fullName) errs.fullName = 'Full name is required'
    if (!form.employeeId) errs.employeeId = 'Employee ID is required'
    if (!form.email) errs.email = 'Email is required'
    if (!editItem && !form.password) errs.password = 'Password is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editItem) {
        await managerService.update(editItem.id, form)
        toast.success('Updated!', 'Manager updated successfully')
      } else {
        await managerService.create(form)
        toast.success('Created!', 'Manager added successfully')
      }
      setModalOpen(false)
      fetchManagers()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await managerService.delete(deleteItem.id)
      toast.success('Deleted!', 'Manager removed')
      setDeleteOpen(false)
      fetchManagers()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      if (item.status === 'active') await managerService.deactivate(item.id)
      else await managerService.activate(item.id)
      toast.success('Updated!', `Manager ${item.status === 'active' ? 'deactivated' : 'activated'}`)
      fetchManagers()
    } catch {
      toast.error('Error', 'Status update failed')
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Managers' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Warehouse Manager Management</h1><p className="page-subtitle">{managers.length} managers registered</p></div>
        <Button icon="+" onClick={openAdd}>Add Manager</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search managers..." />
          </div>
          <span className="text-sm text-muted">{filtered.length} results</span>
        </div>
        {loading ? <table><tbody><SkeletonTable rows={5} cols={7} /></tbody></table> : filtered.length === 0 ? (
          <EmptyState icon="👔" title="No Managers Found" action={openAdd} actionLabel="Add Manager" />
        ) : (
          <>
            <table>
              <thead><tr><th>#</th><th>Manager</th><th>Employee ID</th><th>Department</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {paginated.map((m, i) => (
                  <tr key={m.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={m.fullName} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{m.employeeId}</code></td>
                    <td>{m.department}</td>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{m.warehouseLocation}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openView(m)}>👁️</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>✏️</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(m)}>{m.status === 'active' ? '🔴' : '🟢'}</Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(m)}>🗑️</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Manager' : 'Add Manager'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Add'}</Button></>}>
        <div className="form-row">
          <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required error={errors.fullName} placeholder="Full name" />
          <Input label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} required error={errors.employeeId} placeholder="MGR-001" />
        </div>
        <div className="form-row">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required error={errors.email} placeholder="manager@warehouse.com" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
        </div>
        {!editItem && (
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required error={errors.password} placeholder="Min 6 characters" />
        )}
        <div className="form-row">
          <Select label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          <Select label="Warehouse Location" name="warehouseLocation" value={form.warehouseLocation} onChange={handleChange} options={WAREHOUSE_LOCATIONS.map(l => ({ value: l, label: l }))} />
        </div>
        <Select label="Status" name="status" value={form.status} onChange={handleChange}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Modal>

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Manager Details">
        {viewItem && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
              <Avatar name={viewItem.fullName} size="lg" />
              <div>
                <h3 style={{ fontWeight: 700 }}>{viewItem.fullName}</h3>
                <p className="text-muted text-sm">{viewItem.email}</p>
                <StatusBadge status={viewItem.status} />
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Employee ID</div><div className="detail-value">{viewItem.employeeId}</div></div>
              <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{viewItem.phone}</div></div>
              <div className="detail-item"><div className="detail-label">Department</div><div className="detail-value">{viewItem.department}</div></div>
              <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{viewItem.warehouseLocation}</div></div>
              <div className="detail-item"><div className="detail-label">Joined</div><div className="detail-value">{formatDate(viewItem.createdAt)}</div></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting}
        title="Remove Manager" message={`Remove "${deleteItem?.fullName}"? This cannot be undone.`} />
    </div>
  )
}

export default Managers
