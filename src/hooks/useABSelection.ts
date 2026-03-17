import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import type { UseChessGame } from './useChessGame'

export interface CandidateMove {
  from: string
  to: string
  san: string
  fen: string
}

export interface ABSelectionState {
  isABMode: boolean
  moveA: CandidateMove | null
  moveB: CandidateMove | null
  toggleABMode: () => void
  setCandidate: (from: string, to: string) => void
  resetCandidates: () => void
}

/**
 * Manages A/B candidate move selection.
 *
 * In A/B mode the board stays at the current position — candidate moves are
 * applied to a temporary cloned chess.js instance to compute the resulting
 * FEN without mutating the main game state.
 */
export function useABSelection(game: UseChessGame): ABSelectionState {
  const [isABMode, setIsABMode] = useState(false)
  const [moveA, setMoveA] = useState<CandidateMove | null>(null)
  const [moveB, setMoveB] = useState<CandidateMove | null>(null)

  const toggleABMode = useCallback(() => {
    setIsABMode((prev) => {
      if (prev) {
        // Turning off — clear candidates
        setMoveA(null)
        setMoveB(null)
      }
      return !prev
    })
  }, [])

  const setCandidate = useCallback(
    (from: string, to: string) => {
      // Clone the current position; do not mutate the main game state.
      const clone = new Chess(game.fen)
      let moveResult
      try {
        moveResult = clone.move({ from, to, promotion: 'q' })
      } catch {
        return
      }
      if (!moveResult) return

      const candidate: CandidateMove = {
        from,
        to,
        san: moveResult.san,
        fen: clone.fen(),
      }

      // Fill A first, then B; ignore further clicks when both are set.
      if (moveA === null) {
        setMoveA(candidate)
      } else if (moveB === null) {
        setMoveB(candidate)
      }
    },
    [game.fen, moveA, moveB],
  )

  const resetCandidates = useCallback(() => {
    setMoveA(null)
    setMoveB(null)
  }, [])

  return { isABMode, moveA, moveB, toggleABMode, setCandidate, resetCandidates }
}
