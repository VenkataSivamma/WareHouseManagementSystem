import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { EmptyState } from '../../components/common/States'
import productService from '../../services/productService'
import categoryService from '../../services/categoryService'

const ProductSearch = () => {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('All')
  const [categories, setCategories] = useState([])
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [viewItem, setViewItem] = useState(null)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll()
      setCategories(res.data?.content || res.data || [])
    } catch {
      setCategories([])
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleSearch = async (e) => {
    e.preventDefault()
    setSearching(true)
    try {
      const params = {}
      if (query.trim()) params.q = query.trim()
      if (categoryId !== 'All') params.categoryId = categoryId
      const res = await productService.getAll(params)
      setResults(res.data?.content || res.data || [])
      setSearched(true)
    } catch {
      setResults([])
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  const handleClear = () => {
    setQuery(''); setCategoryId('All'); setResults([]); setSearched(false)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Staff', path: '/staff/dashboard' }, { label: 'Product Search' }]} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Search</h1>
          <p className="page-subtitle">Search and view product details</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch}>
          <div className="form-row" style={{ alignItems: 'flex-end', gap: 12 }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="form-label">Search by Name or SKU</label>
              <div className="input-group">
                <span className="input-icon">🔍</span>
                <input className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Wireless Mouse or SKU-3012" />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
              <button type="submit" className="btn btn-primary" disabled={searching}>{searching ? 'Searching...' : 'Search'}</button>
              {searched && <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>}
            </div>
          </div>
        </form>
      </div>

      {!searched ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Search for Products</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Enter a product name, SKU, or select a category to find products.</p>
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon="📦" title="No Products Found" description="Try a different search term or category." />
      ) : (
        <div className="table-container">
          <div className="table-toolbar">
            <span className="text-sm text-muted">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
          </div>
          <table>
            <thead>
              <tr><th>#</th><th>Product</th><th>SKU</th><th>Category</th><th>Available</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {results.map((p, i) => (
                <tr key={p.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td><strong>{p.name}</strong></td>
                  <td><code style={{ fontSize: '0.8rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{p.sku}</code></td>
                  <td>{p.categoryName}</td>
                  <td>
                    <strong style={{ color: 'var(--text-secondary)' }}>—</strong>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setViewItem(p)}>👁️ View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Product Details">
        {viewItem && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{viewItem.name}</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{viewItem.sku} • {viewItem.categoryName}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Min Stock', value: viewItem.minStock ?? '—', color: 'var(--warning)' },
                { label: 'Price', value: `₹${viewItem.price}`, color: 'var(--info)' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Supplier</div><div className="detail-value">{viewItem.supplierName || '—'}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><StatusBadge status={viewItem.status} /></div></div>
              {viewItem.description && (
                <div className="detail-item" style={{ gridColumn: '1/-1' }}><div className="detail-label">Description</div><div className="detail-value">{viewItem.description}</div></div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductSearch
