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
import categoryService from '../../services/categoryService'

const initForm = { name: '', description: '', status: 'active' }

const Categories = () => {
  const { toast } = useToast()
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [form, setForm] = useState(initForm)
  const [errors, setErrors] = useState({})

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await categoryService.getAll()
      const data = res.data?.content || res.data || []
      setCategories(data)
    } catch {
      toast.error('Error', 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  useEffect(() => {
    let data = categories
    if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter) data = data.filter(c => c.status === statusFilter)
    setFiltered(data)
    setPage(1)
  }, [search, statusFilter, categories])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd = () => { setEditItem(null); setForm(initForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, description: item.description || '', status: item.status }); setErrors({}); setModalOpen(true) }
  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true) }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Category name is required'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (editItem) {
        await categoryService.update(editItem.id, form)
        toast.success('Updated!', 'Category updated successfully')
      } else {
        await categoryService.create(form)
        toast.success('Created!', 'Category created successfully')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoryService.delete(deleteItem.id)
      toast.success('Deleted!', 'Category deleted successfully')
      setDeleteOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (item) => {
    try {
      await categoryService.toggleStatus(item.id)
      toast.success('Updated!', `Category ${item.status === 'active' ? 'deactivated' : 'activated'}`)
      fetchCategories()
    } catch {
      toast.error('Error', 'Status update failed')
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Categories' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">{categories.length} total categories</p>
        </div>
        <Button icon="+" onClick={openAdd}>Add Category</Button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search categories..." />
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="table-toolbar-right">
            <span className="text-sm text-muted">{filtered.length} results</span>
          </div>
        </div>

        {loading ? (
          <table><tbody><SkeletonTable rows={6} cols={6} /></tbody></table>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏷️" title="No Categories Found" description="No categories match your search." action={openAdd} actionLabel="Add Category" />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Category Name</th><th>Description</th><th>Products</th><th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((cat, i) => (
                  <tr key={cat.id}>
                    <td className="text-muted">{(page - 1) * pageSize + i + 1}</td>
                    <td><strong>{cat.name}</strong></td>
                    <td className="text-muted">{cat.description}</td>
                    <td><span className="badge badge-primary">{cat.productCount ?? 0}</span></td>
                    <td><StatusBadge status={cat.status} label={cat.status === 'active' ? 'Active' : 'Inactive'} /></td>
                    <td className="text-muted">{formatDate(cat.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>✏️</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(cat)}>
                          {cat.status === 'active' ? '🔴' : '🟢'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(cat)}>🗑️</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'Add Category'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editItem ? 'Update' : 'Create'}</Button></>}>
        <Input label="Category Name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Electronics" required error={errors.name} />
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="form-control" placeholder="Brief description..." />
        </div>
        <Select label="Status" name="status" value={form.status} onChange={handleChange}
          options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={deleting}
        title="Delete Category" message={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`} />
    </div>
  )
}

export default Categories
