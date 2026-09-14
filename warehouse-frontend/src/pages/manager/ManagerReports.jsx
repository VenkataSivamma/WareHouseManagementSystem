import { useState, useEffect, useCallback } from 'react'
import Breadcrumb from '../../components/common/Breadcrumb'
import Button from '../../components/common/Button'
import { BarChart } from '../../components/common/Charts'
import { useToast } from '../../contexts/ToastContext'
import { jsPDF } from 'jspdf'
import reportService from '../../services/reportService'

const reportTypes = [
  { key: 'monthly', icon: '📅', title: 'Monthly Report', desc: 'Stock in/out summary for the selected month', color: 'var(--primary)' },
  { key: 'low-stock', icon: '⚠️', title: 'Low Stock Report', desc: 'Products below minimum stock threshold', color: 'var(--danger)' },
  { key: 'stock-movement', icon: '📊', title: 'Product Movement Report', desc: 'Detailed movement history per product', color: 'var(--success)' },
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const ManagerReports = () => {
  const { toast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [generating, setGenerating] = useState(null)
  const [generatedReport, setGeneratedReport] = useState(null)
  const [monthlySummary, setMonthlySummary] = useState([])
  const [monthlyDetails, setMonthlyDetails] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
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

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const handleGenerate = async (key) => {
    setGenerating(key)
    try {
      const params = { month: selectedMonth, year: selectedYear }
      let response
      if (key === 'low-stock') response = await reportService.getLowStockReport()
      else if (key === 'monthly') response = await reportService.getMonthlyReport(params)
      else if (key === 'stock-movement') response = await reportService.getStockMovementReport(params)
      setGeneratedReport({ key, data: response?.data || {} })
      toast.success('Report Ready', `${reportTypes.find(r => r.key === key)?.title} generated`)
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
      const reportKey = key === 'summary' ? 'monthly' : key
      let response
      if (reportKey === 'low-stock') response = await reportService.getLowStockReport()
      else if (reportKey === 'monthly') response = await reportService.getMonthlyReport(params)
      else if (reportKey === 'stock-movement') response = await reportService.getStockMovementReport(params)

      const data = response?.data || {}
      const pdf = new jsPDF()
      let y = 22
      const title = reportTypes.find(r => r.key === reportKey)?.title || 'Monthly Summary'
      const writeLine = (text, size = 11, gap = 8) => {
        if (y > 278) { pdf.addPage(); y = 22 }
        pdf.setFontSize(size)
        pdf.text(String(text), 18, y)
        y += gap
      }

      pdf.setTextColor(18, 52, 91)
      writeLine(title, 18, 10)
      writeLine(`${months[parseInt(selectedMonth) - 1]} ${selectedYear}`, 11, 12)
      pdf.setTextColor(35, 68, 103)

      if (reportKey === 'monthly') {
        writeLine(`Stock In: ${data.totalStockIn ?? 0}`)
        writeLine(`Stock Out: ${data.totalStockOut ?? 0}`)
        writeLine(`Purchase Orders: ${data.totalOrders ?? 0}`)
        writeLine(`Revenue: ${data.totalRevenue ?? 0}`)
        writeLine('Top Products', 13, 9)
        ;(data.topProducts || []).forEach(product => writeLine(`${product.name}: ${product.quantity} units`))
      } else if (reportKey === 'low-stock') {
        writeLine(`Low-stock products: ${data.count ?? data.items?.length ?? 0}`, 13, 10)
        ;(data.items || []).forEach(item => writeLine(`${item.productName} | Available: ${item.available} | Minimum: ${item.minStock}`))
      } else {
        const summary = data.summary || {}
        writeLine(`Total movements: ${summary.totalMovements ?? 0}`)
        writeLine(`Stock In movements: ${summary.totalStockIn ?? 0}`)
        writeLine(`Stock Out movements: ${summary.totalStockOut ?? 0}`)
        writeLine('Movement Details', 13, 9)
        ;(data.movements || []).forEach(item => writeLine(`${item.product} | ${item.type} | ${item.quantity} units`))
      }

      pdf.save(`${key}-report.pdf`)
      toast.success('Downloaded!', 'PDF report downloaded')
    } catch {
      toast.error('Error', 'Download failed')
    } finally {
      setGenerating(null)
    }
  }

  const years = []
  for (let y = new Date().getFullYear(); y >= 2022; y--) years.push(String(y))

  const chartData = generatedReport?.key === 'monthly'
    ? [
        { label: 'Stock In', value: generatedReport.data.totalStockIn ?? 0 },
        { label: 'Stock Out', value: generatedReport.data.totalStockOut ?? 0 },
        { label: 'Orders', value: generatedReport.data.totalOrders ?? 0 },
      ]
    : generatedReport?.key === 'low-stock'
      ? (generatedReport.data.items || []).slice(0, 8).map(item => ({
          label: item.productName?.slice(0, 12) || 'Product',
          value: item.available ?? 0,
          value2: item.minStock ?? 0,
        }))
      : generatedReport?.key === 'stock-movement'
        ? [
            { label: 'Stock In', value: generatedReport.data.summary?.totalStockIn ?? 0 },
            { label: 'Stock Out', value: generatedReport.data.summary?.totalStockOut ?? 0 },
            { label: 'Movements', value: generatedReport.data.summary?.totalMovements ?? 0 },
          ]
        : []

  const generatedTitle = reportTypes.find(r => r.key === generatedReport?.key)?.title

  return (
    <div>
      <Breadcrumb items={[{ label: 'Manager', path: '/manager/dashboard' }, { label: 'Reports' }]} />
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Generate warehouse reports</p></div>
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
              <div style={{ fontWeight: 700 }}>{r.title}</div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{r.desc}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => handleGenerate(r.key)} loading={generating === r.key} style={{ flex: 1 }}>📊 Generate</Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload(r.key)} loading={generating === `dl-${r.key}`}>⬇️ PDF</Button>
            </div>
          </div>
        ))}
      </div>

      {generatedReport && (
        <div className="mb-24">
          {chartData.length > 0 ? (
            <BarChart
              title={`${generatedTitle} Overview`}
              subtitle="Generated report visualized from the latest warehouse data"
              data={chartData}
            />
          ) : (
            <div className="card report-result-empty">
              <h3 className="card-title">{generatedTitle}</h3>
              <p className="text-muted">No data is available to visualize for this report.</p>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Monthly Summary — {months[parseInt(selectedMonth) - 1]} {selectedYear}</h3>
          <Button variant="secondary" size="sm" onClick={() => handleDownload('summary')} loading={generating === 'dl-summary'}>⬇️ Download</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {summaryLoading ? (
            <p style={{ padding: 24, color: 'var(--text-secondary)' }}>Loading summary...</p>
          ) : monthlySummary.length === 0 ? (
            <p style={{ padding: 24, color: 'var(--text-secondary)' }}>No summary data available for this period.</p>
          ) : (
            <table>
              <thead><tr><th>Metric</th><th>This Month</th><th>Last Month</th><th>Change</th></tr></thead>
              <tbody>
                {monthlySummary.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.metric}</strong></td>
                    <td>{row.current}</td>
                    <td className="text-muted">{row.previous}</td>
                    <td style={{ color: row.up ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{row.change}</td>
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
            <span className="text-sm text-muted">{months[parseInt(selectedMonth) - 1]} {selectedYear}</span>
          </div>
          {monthlyDetails.topProducts?.length > 0 ? (
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Total Movement</th></tr></thead>
              <tbody>
                {monthlyDetails.topProducts.map((product, index) => (
                  <tr key={`${product.name}-${index}`}>
                    <td className="text-muted">{index + 1}</td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.quantity} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted" style={{ padding: 24 }}>No product movement recorded for this period.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ManagerReports
