import api from './api'

const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  toggleStatus: (id) => api.patch(`/categories/${id}/toggle-status`),
  search: (query) => api.get('/categories/search', { params: { q: query } }),
}

export default categoryService
