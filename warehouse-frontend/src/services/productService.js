import api from './api'

const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { q: query } }),
  searchByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getBySku: (sku) => api.get(`/products/sku/${sku}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getLowStock: () => api.get('/products/low-stock'),
  toggleStatus: (id) => api.patch(`/products/${id}/toggle-status`),
}

export default productService
