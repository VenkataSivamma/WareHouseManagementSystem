import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    const isAuthenticationRequest = requestUrl.includes('/auth/')
    if ([401, 403].includes(error.response?.status) && !isAuthenticationRequest) {
      let loginPath = '/login'
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
        if (storedUser?.role?.toUpperCase() === 'ADMIN') loginPath = '/admin/login'
      } catch {
      }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = loginPath
    }
    return Promise.reject(error)
  }
)

export default api
