import { useState, useEffect, useRef } from 'react'
import { fetchLichessStats, type LichessOpeningStats } from '../services/lichessApi'

export interface LichessStatsState {
  data: LichessOpeningStats | null
  loading: boolean
  error: string | null
}

const DEBOUNCE_MS = 500

/**
 * Fetches Lichess opening explorer statistics for a given FEN, debounced by
 * 500 ms to stay within the ~1 req/s rate limit. Cancels any in-flight
 * request when the FEN changes.
 */
export function useLichessStats(fen: string): LichessStatsState {
  const [state, setState] = useState<LichessStatsState>({
    data: null,
    loading: false,
    error: null,
  })

  // Keep a ref to the current AbortController so we can cancel in-flight requests.
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Abort any previous in-flight request immediately.
    abortRef.current?.abort()

    setState((prev) => ({ ...prev, loading: true, error: null }))

    const controller = new AbortController()
    abortRef.current = controller

    const timer = setTimeout(async () => {
      try {
        const data = await fetchLichessStats(fen, controller.signal)
        setState({ data, loading: false, error: null })
      } catch (err) {
        // Ignore abort errors — they are intentional cancellations.
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error: message })
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [fen])

  return state
}
