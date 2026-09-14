import { useState } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import { useToast } from '../../contexts/ToastContext'
import productService from '../../services/productService'
import inventoryService from '../../services/inventoryService'

const reasons = ['Customer Order', 'Internal Use', 'Transfer to Another Warehouse', 'Damaged/Disposal', 'Return to Supplier', 'Other']

const StockOut = () => {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [form, setForm] = useState({ quantity: '', reason: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSearch = async (val) => {
    setSearch(val)
    if (val.length > 1) {
      try {
        const res = await productService.search(val)
        setSearchResults(res.data?.content || res.data || [])
      } catch {
        setSearchResults([])
      }
    } else {
      setSearchResults([])
    }
  }

  const handleSelect = (product) => {
    setSelectedProduct(product); setSearch(product.name); setSearchResults([])
  }

  const validate = () => {
    const errs = {}
    if (!selectedProduct) errs.product = 'Please select a product'
    if (!form.quantity || form.quantity <= 0) errs.quantity = 'Enter a valid quantity'
    else if (parseInt(form.quantity) > (selectedProduct?.quantity ?? 0)) errs.quantity = `Cannot exceed available stock (${selectedProduct?.quantity})`
    if (!form.reason) errs.reason = 'Please select a reason'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await inventoryService.stockOut({ productId: selectedProduct.id, quantity: Number(form.quantity), reason: form.reason, notes: form.notes })
      setSubmitted(true)
      toast.success('Submitted!', `Stock Out for ${selectedProduct.name} submitted for approval`)
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedProduct(null); setSearch(''); setForm({ quantity: '', reason: '', notes: '' }); setErrors({}); setSubmitted(false)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Staff', path: '/staff/dashboard' }, { label: 'Stock Out' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Stock Out</h1><p className="page-subtitle">Record outgoing stock</p></div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {submitted ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>📤</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Stock Out Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Your stock out request has been submitted and is pending manager approval.</p>
            <Button onClick={handleReset}>Submit Another</Button>
          </div>
        ) : (
          <div className="card">
            <div className="card-header"><h3 className="card-title">📤 Stock Out Form</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Search Product <span className="required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <div className="input-group">
                    <span className="input-icon">🔍</span>
                    <input className={`form-control${errors.product ? ' error' : ''}`} value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by product name or SKU..." />
                  </div>
                  {searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--card-shadow-hover)', zIndex: 50, maxHeight: 200, overflowY: 'auto' }}>
                      {searchResults.map(p => (
                        <div key={p.id} onClick={() => handleSelect(p)}
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.sku} • Available: <strong style={{ color: p.quantity < 10 ? 'var(--danger)' : 'var(--success)' }}>{p.quantity}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.product && <p className="form-error">{errors.product}</p>}
              </div>

              {selectedProduct && (
                <div style={{ background: selectedProduct.quantity < 10 ? 'var(--danger-light)' : 'var(--primary-light)', border: `1px solid ${selectedProduct.quantity < 10 ? 'var(--danger)' : 'var(--primary)'}`, borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedProduct.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedProduct.sku} • {selectedProduct.categoryName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Available Stock</div>
                      <div style={{ fontWeight: 700, fontSize: '1.2rem', color: selectedProduct.quantity < 10 ? 'var(--danger)' : 'var(--primary)' }}>{selectedProduct.quantity}</div>
                    </div>
                  </div>
                  {selectedProduct.quantity < 10 && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 6, fontWeight: 500 }}>⚠️ Low stock warning</p>}
                </div>
              )}

              <Input label="Quantity to Remove" name="quantity" type="number" value={form.quantity}
                onChange={e => { setForm(p => ({ ...p, quantity: e.target.value })); if (errors.quantity) setErrors(p => ({ ...p, quantity: '' })) }}
                placeholder="Enter quantity" required error={errors.quantity} icon="📦" />

              <Select label="Reason" name="reason" value={form.reason}
                onChange={e => { setForm(p => ({ ...p, reason: e.target.value })); if (errors.reason) setErrors(p => ({ ...p, reason: '' })) }}
                required error={errors.reason} options={reasons.map(r => ({ value: r, label: r }))} placeholder="Select reason..." />

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-control" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any additional notes..." rows={3} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="submit" variant="danger" loading={submitting} icon="📤" style={{ flex: 1 }}>Submit Stock Out</Button>
                <Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockOut
