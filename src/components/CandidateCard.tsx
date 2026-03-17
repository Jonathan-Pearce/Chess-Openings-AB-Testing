import { Chessboard } from 'react-chessboard'
import { MetricsPanel } from './MetricsPanel'
import type { CandidateMove } from '../hooks/useABSelection'
import type { StockfishState } from '../hooks/useStockfish'
import type { LichessStatsState } from '../hooks/useLichessStats'

export interface CandidateCardProps {
  label: 'A' | 'B'
  candidate: CandidateMove | null
  eval_: StockfishState
  lichess: LichessStatsState
}

/** Inner component — only rendered when a candidate is present. */
function CandidateCardInner({
  label,
  candidate,
  eval_,
  lichess,
}: {
  label: 'A' | 'B'
  candidate: CandidateMove
  eval_: StockfishState
  lichess: LichessStatsState
}) {
  const accentText = label === 'A' ? 'text-blue-700' : 'text-orange-700'
  const accentBadge =
    label === 'A'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-orange-100 text-orange-700'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${accentBadge}`}>
          Move {label}
        </span>
        <span className={`font-mono text-sm font-semibold ${accentText}`}>{candidate.san}</span>
      </div>

      {/* Mini read-only board */}
      <div className="w-full">
        <Chessboard
          options={{
            position: candidate.fen,
            allowDrawingArrows: false,
          }}
        />
      </div>

      <MetricsPanel eval_={eval_} lichess={lichess} />
    </div>
  )
}

/**
 * Displays a mini read-only board and metrics for one A/B candidate move.
 * Shows a placeholder when no candidate has been selected yet.
 */
export function CandidateCard({ label, candidate, eval_, lichess }: CandidateCardProps) {
  const borderColor = label === 'A' ? 'border-blue-300' : 'border-orange-300'
  const bgColor = label === 'A' ? 'bg-blue-50' : 'bg-orange-50'
  const accentText = label === 'A' ? 'text-blue-400' : 'text-orange-400'

  return (
    <div className={`rounded-lg border-2 ${borderColor} ${bgColor} p-4`}>
      {candidate ? (
        <CandidateCardInner label={label} candidate={candidate} eval_={eval_} lichess={lichess} />
      ) : (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className={`text-3xl font-black ${accentText}`}>{label}</span>
          <p className="text-sm text-gray-500 text-center">
            Enable A/B Mode and click a piece + destination square to set Move {label}
          </p>
        </div>
      )}
    </div>
  )
}
