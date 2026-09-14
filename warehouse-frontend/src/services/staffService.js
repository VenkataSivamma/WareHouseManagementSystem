import api from './api'

const staffService = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  activate: (id) => api.patch(`/staff/${id}/activate`),
  deactivate: (id) => api.patch(`/staff/${id}/deactivate`),
  search: (query) => api.get('/staff/search', { params: { q: query } }),
}

export default staffService
