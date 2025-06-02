import { useCallback } from 'react'

export function useRefreshPage(): () => void {
  return useCallback(() => {
    window.location.reload()
  }, [])
}
