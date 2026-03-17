import { useState, useEffect, useRef } from 'react'
import { StockfishWorker, type EvalResult } from '../workers/stockfish.worker'

export interface StockfishState {
  score: number | null
  mate: number | null
  depth: number
  bestMove: string | null
  loading: boolean
}

const INITIAL_STATE: StockfishState = {
  score: null,
  mate: null,
  depth: 0,
  bestMove: null,
  loading: false,
}

/**
 * Evaluates a FEN position with Stockfish at the given depth.
 *
 * Creates a single long-lived StockfishWorker per hook instance and
 * re-triggers analysis whenever `fen` changes. Shows intermediate `loading`
 * state and resolves to the final result when `bestmove` is received.
 */
export function useStockfish(fen: string, targetDepth = 18): StockfishState {
  const engineRef = useRef<StockfishWorker | null>(null)
  const [state, setState] = useState<StockfishState>(INITIAL_STATE)

  // Create the engine once; clean up on unmount.
  useEffect(() => {
    const engine = new StockfishWorker(import.meta.env.BASE_URL)
    engineRef.current = engine
    return () => {
      engine.terminate()
      engineRef.current = null
    }
  }, [])

  // Trigger a new evaluation whenever the FEN (or depth) changes.
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    setState((prev) => ({ ...prev, loading: true }))

    engine.evaluate(fen, targetDepth, (result: EvalResult) => {
      setState({ ...result, loading: false })
    })
  }, [fen, targetDepth])

  return state
}
