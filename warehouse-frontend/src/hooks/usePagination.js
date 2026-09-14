import { useState, useCallback } from 'react'

export function usePagination(initialPage = 1, initialSize = 10) {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialSize)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / pageSize)

  const goToPage = useCallback((p) => {
    if (p >= 1 && p <= totalPages) setPage(p)
  }, [totalPages])

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage])
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage])
  const resetPage = useCallback(() => setPage(1), [])

  return { page, pageSize, total, totalPages, setTotal, setPageSize, goToPage, nextPage, prevPage, resetPage }
}

export default usePagination
