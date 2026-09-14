import api from './api'

const deliveryService = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
  markDelivered: (id, data) => api.patch(`/deliveries/${id}/delivered`, data),
  addNotes: (id, notes) => api.patch(`/deliveries/${id}/notes`, { notes }),
  uploadProof: (id, formData) => api.post(`/deliveries/${id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory: (params) => api.get('/deliveries/history', { params }),
  getBySupplier: () => api.get('/deliveries/supplier'),
}

export default deliveryService
