export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatCurrency = (amount) => {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
}

export const formatNumber = (num) => {
  if (num == null) return '—'
  return new Intl.NumberFormat('en-IN').format(num)
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const truncate = (str, len = 40) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

export const getStatusBadgeClass = (status) => {
  const map = {
    active: 'badge-success', inactive: 'badge-secondary',
    pending: 'badge-warning', approved: 'badge-success',
    rejected: 'badge-danger', completed: 'badge-primary',
    cancelled: 'badge-secondary', low: 'badge-danger',
    available: 'badge-success', reserved: 'badge-warning',
    damaged: 'badge-danger', delivered: 'badge-success',
    accepted: 'badge-success', in_transit: 'badge-info',
  }
  return map[status?.toLowerCase()] || 'badge-secondary'
}

export const getRoleDashboard = (role) => {
  const map = {
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    STAFF: '/staff/dashboard',
    SUPPLIER: '/supplier/dashboard',
  }
  return map[role?.toUpperCase()] || '/login'
}

export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const paginate = (items, page, pageSize) => {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
