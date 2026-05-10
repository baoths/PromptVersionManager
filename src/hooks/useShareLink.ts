import { useMemo } from 'react'
import { buildShareURL, type SharedPayload } from '../utils/urlCodec'

export function useShareLink(payload: SharedPayload | null) {
  const base = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return `${window.location.origin}${window.location.pathname}`
  }, [])

  const url = useMemo(() => {
    if (!payload || !base) {
      return ''
    }
    return buildShareURL(payload, base)
  }, [payload, base])

  return { url }
}
