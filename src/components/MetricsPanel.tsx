import { EvalBar } from './EvalBar'
import { OpeningStats } from './OpeningStats'
import type { StockfishState } from '../hooks/useStockfish'
import type { LichessStatsState } from '../hooks/useLichessStats'

export interface MetricsPanelProps {
  eval_: StockfishState
  lichess: LichessStatsState
}

/**
 * Combines engine evaluation and Lichess opening statistics into a single
 * panel. Used for the current position and reused inside CandidateCard.
 */
export function MetricsPanel({ eval_, lichess }: MetricsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Engine evaluation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Engine Evaluation</h2>
        <EvalBar
          score={eval_.score}
          mate={eval_.mate}
          loading={eval_.loading}
        />
        {eval_.bestMove && !eval_.loading && (
          <p className="mt-2 text-xs text-gray-500">
            Best move:{' '}
            <span className="font-mono font-medium text-gray-700">{eval_.bestMove}</span>
            {' '}(depth {eval_.depth})
          </p>
        )}
      </div>

      {/* Lichess opening statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Opening Statistics</h2>
        <OpeningStats
          data={lichess.data}
          loading={lichess.loading}
          error={lichess.error}
        />
      </div>
    </div>
  )
}
