import { CandidateCard } from './CandidateCard'
import { AnalysisReport } from './AnalysisReport'
import { useStockfish } from '../hooks/useStockfish'
import { useLichessStats } from '../hooks/useLichessStats'
import type { CandidateMove } from '../hooks/useABSelection'

export interface ABTestPanelProps {
  moveA: CandidateMove | null
  moveB: CandidateMove | null
  /** FEN of the base position — used to determine the side to move. */
  currentFen: string
}

/**
 * Side-by-side display of two candidate move cards plus a statistical
 * analysis report once both moves are selected.
 *
 * Hooks are lifted here so the same evaluation data can be shared between
 * each CandidateCard and the AnalysisReport without duplicate API calls.
 */
export function ABTestPanel({ moveA, moveB, currentFen }: ABTestPanelProps) {
  // Always call hooks unconditionally; pass empty string when no candidate yet.
  const evalA = useStockfish(moveA?.fen ?? '')
  const evalB = useStockfish(moveB?.fen ?? '')
  const lichessA = useLichessStats(moveA?.fen ?? '')
  const lichessB = useLichessStats(moveB?.fen ?? '')

  // Parse side to move from the base FEN (field 2: 'w' or 'b').
  const sideToMove = (currentFen.split(' ')[1] ?? 'w') as 'w' | 'b'

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Candidate Move Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CandidateCard label="A" candidate={moveA} eval_={evalA} lichess={lichessA} />
        <CandidateCard label="B" candidate={moveB} eval_={evalB} lichess={lichessB} />
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
