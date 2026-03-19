import { CandidateCard } from './CandidateCard'
import { AnalysisReport } from './AnalysisReport'
import { useStockfish } from '../hooks/useStockfish'
import { useLichessStats } from '../hooks/useLichessStats'
import type { CandidateMove } from '../hooks/useABSelection'
import type { Move } from 'chess.js'

export interface ABTestPanelProps {
  moveA: CandidateMove | null
  moveB: CandidateMove | null
  /** FEN of the base position — used to determine the side to move. */
  currentFen: string
  legalMoves: Move[]
  onSelectMoveA: (san: string) => void
  onSelectMoveB: (san: string) => void
  onClearMoveA: () => void
  onClearMoveB: () => void
}

/**
 * Side-by-side display of two candidate move columns with dropdown + visual
 * board selection, plus a statistical analysis report once both are chosen.
 */
export function ABTestPanel({
  moveA,
  moveB,
  currentFen,
  legalMoves,
  onSelectMoveA,
  onSelectMoveB,
  onClearMoveA,
  onClearMoveB,
}: ABTestPanelProps) {
  // Always call hooks unconditionally; pass empty string when no candidate yet.
  const evalA = useStockfish(moveA?.fen ?? '')
  const evalB = useStockfish(moveB?.fen ?? '')
  const lichessA = useLichessStats(moveA?.fen ?? '')
  const lichessB = useLichessStats(moveB?.fen ?? '')

  // Parse side to move from the base FEN (field 2: 'w' or 'b').
  const sideToMove = (currentFen.split(' ')[1] ?? 'w') as 'w' | 'b'

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <CandidateCard
          label="A"
          candidate={moveA}
          eval_={evalA}
          lichess={lichessA}
          currentFen={currentFen}
          legalMoves={legalMoves}
          onSelectMove={onSelectMoveA}
          onClearMove={onClearMoveA}
        />
        <CandidateCard
          label="B"
          candidate={moveB}
          eval_={evalB}
          lichess={lichessB}
          currentFen={currentFen}
          legalMoves={legalMoves}
          onSelectMove={onSelectMoveB}
          onClearMove={onClearMoveB}
        />
      </div>

      {moveA && moveB && (
        <AnalysisReport
          moveA={moveA}
          moveB={moveB}
          evalA={evalA}
          evalB={evalB}
          lichessA={lichessA}
          lichessB={lichessB}
          sideToMove={sideToMove}
        />
      )}
    </div>
  )
}
