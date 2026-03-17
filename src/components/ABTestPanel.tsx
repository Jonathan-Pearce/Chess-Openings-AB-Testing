import { CandidateCard } from './CandidateCard'
import type { CandidateMove } from '../hooks/useABSelection'

export interface ABTestPanelProps {
  moveA: CandidateMove | null
  moveB: CandidateMove | null
}

/**
 * Side-by-side display of two candidate move cards.
 * Each card shows a mini board at the resulting position with engine eval
 * and Lichess opening statistics.
 */
export function ABTestPanel({ moveA, moveB }: ABTestPanelProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Candidate Move Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CandidateCard label="A" candidate={moveA} />
        <CandidateCard label="B" candidate={moveB} />
      </div>
    </div>
  )
}
