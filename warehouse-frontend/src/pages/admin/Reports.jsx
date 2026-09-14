import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import { useToast } from '../../contexts/ToastContext'
import reportService from '../../services/reportService'

const reportTypes = [
  { key: 'inventory', icon: '🗄️', title: 'Inventory Report', desc: 'Current stock levels, available, reserved and damaged items', color: 'var(--primary)' },
  { key: 'supplier', icon: '🏢', title: 'Supplier Report', desc: 'Supplier performance, order history and delivery stats', color: 'var(--success)' },
  { key: 'purchase', icon: '🛒', title: 'Purchase Report', desc: 'Purchase orders summary, approvals and rejections', color: 'var(--warning)' },
  { key: 'product', icon: '📦', title: 'Product Report', desc: 'Product catalog, pricing and category breakdown', color: 'var(--info)' },
  { key: 'stock-movement', icon: '📊', title: 'Stock Movement Report', desc: 'Stock in/out history, trends and movement analysis', color: 'var(--primary)' },
  { key: 'low-stock', icon: '⚠️', title: 'Low Stock Report', desc: 'Products below minimum stock threshold', color: 'var(--danger)' },
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const Reports = () => {
  const { toast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [generating, setGenerating] = useState(null)
  const [monthlySummary, setMonthlySummary] = useState([])
  const [monthlyDetails, setMonthlyDetails] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const fetchMonthlySummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await reportService.getMonthlyReport({ month: selectedMonth, year: selectedYear })
      const report = res.data || {}
      if (Array.isArray(report)) {
        setMonthlySummary(report)
        setMonthlyDetails(null)
      } else {
        setMonthlyDetails(report)
        setMonthlySummary([
          { metric: 'Stock In', current: report.totalStockIn ?? 0, previous: '—', change: 'This period', up: true },
          { metric: 'Stock Out', current: report.totalStockOut ?? 0, previous: '—', change: 'This period', up: true },
          { metric: 'Purchase Orders', current: report.totalOrders ?? 0, previous: '—', change: 'This period', up: true },
          { metric: 'Revenue', current: report.totalRevenue ?? 0, previous: '—', change: 'This period', up: true },
        ])
      }
    } catch {
      setMonthlySummary([])
      setMonthlyDetails(null)
    } finally {
      setSummaryLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => { fetchMonthlySummary() }, [fetchMonthlySummary])

  const handleGenerate = async (key) => {
    setGenerating(key)
    try {
      const params = { month: selectedMonth, year: selectedYear }
      if (key === 'low-stock') await reportService.getLowStockReport()
      else if (key === 'inventory') await reportService.getInventoryReport(params)
      else if (key === 'supplier') await reportService.getSupplierReport(params)
      else if (key === 'purchase') await reportService.getPurchaseReport(params)
      else if (key === 'product') await reportService.getProductReport(params)
      else if (key === 'stock-movement') await reportService.getStockMovementReport(params)
      toast.success('Report Ready', `${reportTypes.find(r => r.key === key)?.title} generated successfully`)
    } catch {
      toast.error('Error', 'Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownload = async (key) => {
    setGenerating(`dl-${key}`)
    try {
      const params = { month: selectedMonth, year: selectedYear }
      const res = await reportService.downloadReport(key, params)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${key}-report.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Downloaded!', 'Report downloaded as PDF')
    } catch {
      toast.error('Error', 'Download failed')
    } finally {
      setGenerating(null)
    }
  }

  const years = []
  for (let y = new Date().getFullYear(); y >= 2022; y--) years.push(String(y))

  return (
    <div>
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Reports' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Generate and download warehouse reports</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control" style={{ width: 140 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" style={{ width: 100 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-3 mb-24">
        {reportTypes.map(r => (
          <div key={r.key} className="card" style={{ borderTop: `4px solid ${r.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, background: `${r.color}20`, borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.title}</div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{r.desc}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => handleGenerate(r.key)} loading={generating === r.key} style={{ flex: 1 }}>
                📊 Generate
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload(r.key)} loading={generating === `dl-${r.key}`}>
                ⬇️ PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                🖨️
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Monthly Summary — {months[parseInt(selectedMonth) - 1]} {selectedYear}</h3>
          <Button variant="secondary" size="sm" onClick={() => handleDownload('monthly')} loading={generating === 'dl-monthly'}>⬇️ Download</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {summaryLoading ? (
            <p style={{ padding: 24, color: 'var(--text-secondary)' }}>Loading summary...</p>
          ) : monthlySummary.length === 0 ? (
            <p style={{ padding: 24, color: 'var(--text-secondary)' }}>No summary data available for this period.</p>
          ) : (
            <table className="admin-report-table">
              <thead>
                <tr><th>Metric</th><th>This Month</th><th>Last Month</th><th>Change</th><th>Status</th></tr>
              </thead>
              <tbody>
                {monthlySummary.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.metric}</strong></td>
                    <td>{row.current}</td>
                    <td className="text-muted">{row.previous}</td>
                    <td style={{ color: row.up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{row.change}</td>
                    <td><span className={`badge ${row.up ? 'badge-success' : 'badge-danger'}`}>{row.up ? '↑ Up' : '↓ Down'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {monthlyDetails && (
        <div className="card mt-24">
          <div className="card-header">
            <h3 className="card-title">🏆 Top Products by Movement</h3>
          </div>
          {monthlyDetails.topProducts?.length > 0 ? (
            <table className="admin-report-table">
              <thead><tr><th>#</th><th>Product</th><th>Movement</th></tr></thead>
              <tbody>
                {monthlyDetails.topProducts.map((product, index) => (
                  <tr key={`${product.name}-${index}`}>
                    <td>{index + 1}</td><td><strong>{product.name}</strong></td><td>{product.quantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: 24, color: 'var(--text-secondary)' }}>No product movement recorded for this period.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
