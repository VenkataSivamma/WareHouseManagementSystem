import api from './api'

const reportService = {
  getInventoryReport: (params) => api.get('/reports/inventory', { params }),
  getSupplierReport: (params) => api.get('/reports/supplier', { params }),
  getPurchaseReport: (params) => api.get('/reports/purchase', { params }),
  getProductReport: (params) => api.get('/reports/product', { params }),
  getStockMovementReport: (params) => api.get('/reports/stock-movement', { params }),
  getLowStockReport: () => api.get('/reports/low-stock'),
  getMonthlyReport: (params) => api.get('/reports/monthly', { params }),
  downloadReport: (type, params) => api.get(`/reports/${type}/download`, { params, responseType: 'blob' }),
}

export default reportService
