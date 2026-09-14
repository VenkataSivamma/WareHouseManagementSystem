import api from './api'

const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  getByProduct: (productId) => api.get(`/inventory/product/${productId}`),
  stockIn: (data) => api.post('/inventory/stock-in', data),
  stockOut: (data) => api.post('/inventory/stock-out', data),
  getLowStock: () => api.get('/inventory/low-stock'),
  getAvailable: (params) => api.get('/inventory/available', { params }),
  getReserved: (params) => api.get('/inventory/reserved', { params }),
  getDamaged: (params) => api.get('/inventory/damaged', { params }),
  getMovements: (params) => api.get('/inventory/movements', { params }),
  approveStockIn: (id) => api.patch(`/inventory/stock-in/${id}/approve`),
  approveStockOut: (id) => api.patch(`/inventory/stock-out/${id}/approve`),
  rejectStock: (id, reason) => api.patch(`/inventory/${id}/reject`, { reason }),
  getStockHistory: (productId) => api.get(`/inventory/history/${productId}`),
}

export default inventoryService
