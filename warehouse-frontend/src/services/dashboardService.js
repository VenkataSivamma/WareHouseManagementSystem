import api from './api'

const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getAdminCharts: () => api.get('/dashboard/admin/charts'),
  getAdminActivities: () => api.get('/dashboard/admin/activities'),
  getAdminNotifications: () => api.get('/dashboard/admin/notifications'),
  getManagerStats: () => api.get('/dashboard/manager/stats'),
  getManagerCharts: () => api.get('/dashboard/manager/charts'),
  getManagerActivities: () => api.get('/dashboard/manager/activities'),
  getStaffStats: () => api.get('/dashboard/staff/stats'),
  getStaffTasks: () => api.get('/dashboard/staff/tasks'),
  getSupplierStats: () => api.get('/dashboard/supplier/stats'),
  getSupplierOrders: () => api.get('/dashboard/supplier/orders'),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/notifications/read-all'),
}

export default dashboardService
