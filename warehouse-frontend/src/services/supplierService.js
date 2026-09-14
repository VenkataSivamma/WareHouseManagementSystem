import api from './api'

const supplierService = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  toggleStatus: (id) => api.patch(`/suppliers/${id}/toggle-status`),
  search: (query) => api.get('/suppliers/search', { params: { q: query } }),
  getProfile: () => api.get('/suppliers/profile'),
  updateProfile: (data) => api.put('/suppliers/profile', data),
}

export default supplierService
