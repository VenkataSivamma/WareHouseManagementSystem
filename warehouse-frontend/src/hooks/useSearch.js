import { useState, useEffect, useCallback } from 'react'

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useSearch(initialValue = '') {
  const [query, setQuery] = useState(initialValue)
  const debouncedQuery = useDebounce(query, 400)

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  const clearSearch = useCallback(() => setQuery(''), [])

  return { query, debouncedQuery, handleSearch, clearSearch, setQuery }
}

export default useSearch
