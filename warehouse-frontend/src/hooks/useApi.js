import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(apiFunc, immediate = false, params = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFunc(...args)
      if (mountedRef.current) {
        setData(res.data)
        setLoading(false)
      }
      return { success: true, data: res.data }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong'
      if (mountedRef.current) {
        setError(msg)
        setLoading(false)
      }
      return { success: false, message: msg }
    }
  }, [apiFunc])

  useEffect(() => {
    if (immediate) execute(params)
  }, [])

  return { data, loading, error, execute, setData }
}

export default useApi
