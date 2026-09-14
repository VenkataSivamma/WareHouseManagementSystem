import api from './api'

const managerService = {
  getAll: (params) => api.get('/managers', { params }),
  getById: (id) => api.get(`/managers/${id}`),
  create: (data) => api.post('/managers', data),
  update: (id, data) => api.put(`/managers/${id}`, data),
  delete: (id) => api.delete(`/managers/${id}`),
  activate: (id) => api.patch(`/managers/${id}/activate`),
  deactivate: (id) => api.patch(`/managers/${id}/deactivate`),
  search: (query) => api.get('/managers/search', { params: { q: query } }),
}

export default managerService
