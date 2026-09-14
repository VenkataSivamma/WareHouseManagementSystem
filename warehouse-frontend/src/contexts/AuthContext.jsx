import { createContext, useContext, useReducer, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
}

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null }
    case AUTH_ACTIONS.LOGIN_FAIL:
      return { ...state, loading: false, error: action.payload }
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, user: null, token: null }
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload } }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const saveSession = (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const clearSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const adminLogin = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const res = await authService.adminLogin(credentials)
      const { user, token } = res.data
      saveSession(user, token)
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      return { success: true, user }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const managerLogin = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const res = await authService.managerLogin(credentials)
      const { user, token } = res.data
      saveSession(user, token)
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      return { success: true, user }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const staffLogin = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const res = await authService.staffLogin(credentials)
      const { user, token } = res.data
      saveSession(user, token)
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      return { success: true, user }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const supplierLogin = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const res = await authService.supplierLogin(credentials)
      const { user, token } = res.data
      saveSession(user, token)
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token } })
      return { success: true, user }
    } catch (err) {
      clearSession()
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const registerManager = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        employeeId: data.employeeId,
        department: data.department,
        warehouseLocation: data.warehouseLocation,
      }
      const res = await authService.registerManager(payload)
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const registerSupplier = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      // Map frontend fields to backend expected fields
      const payload = {
        name: data.contactPerson,
        email: data.email,
        password: data.password,
        phone: data.phone,
        companyName: data.companyName,
        address: data.companyAddress,
        contactPerson: data.contactPerson,
        taxId: data.gstNumber,
      }
      const res = await authService.registerSupplier(payload)
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
      return { success: true, data: res.data }
    } catch (err) {
      clearSession()
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: msg })
      return { success: false, message: msg }
    }
  }, [])

  const logout = useCallback(async () => {
    try { await authService.logout() } catch (err) { console.error('Logout failed', err) }
    clearSession()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }, [])

  const updateProfile = useCallback((data) => {
    const updated = { ...state.user, ...data }
    localStorage.setItem('user', JSON.stringify(updated))
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: data })
  }, [state.user])

  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  const isAuthenticated = !!state.token && !!state.user
  const role = state.user?.role || null

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthenticated,
      role,
      adminLogin,
      managerLogin,
      staffLogin,
      supplierLogin,
      registerManager,
      registerSupplier,
      logout,
      updateProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
