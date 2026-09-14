import api from './api'

const authService = {
  adminLogin: (data) => api.post('/auth/admin/login', data),
  managerLogin: (data) => api.post('/auth/manager/login', data),
  staffLogin: (data) => api.post('/auth/staff/login', data),
  supplierLogin: (data) => api.post('/auth/supplier/login', data),
  registerManager: (data) => api.post('/auth/register/manager', data),
  registerSupplier: (data) => api.post('/auth/register/supplier', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export default authService
