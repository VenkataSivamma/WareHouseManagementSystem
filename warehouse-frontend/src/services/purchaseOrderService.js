import api from './api'

const purchaseOrderService = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  createSimple: (data) => api.post('/purchase-orders/simple', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  updateSimple: (id, data) => api.put(`/purchase-orders/${id}/simple`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  approve: (id) => api.patch(`/purchase-orders/${id}/approve`),
  reject: (id, reason) => api.patch(`/purchase-orders/${id}/reject`, { reason }),
  complete: (id) => api.patch(`/purchase-orders/${id}/complete`),
  cancel: (id) => api.patch(`/purchase-orders/${id}/cancel`),
  assignSupplier: (id, supplierId) => api.patch(`/purchase-orders/${id}/assign-supplier`, { supplierId }),
  acceptOrder: (id) => api.patch(`/purchase-orders/${id}/accept`),
  getBySupplier: () => api.get('/purchase-orders/supplier'),
  getTimeline: (id) => api.get(`/purchase-orders/${id}/timeline`),
  search: (query) => api.get('/purchase-orders/search', { params: { q: query } }),
}

export default purchaseOrderService
