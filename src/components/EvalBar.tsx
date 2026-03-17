export interface EvalBarProps {
  score: number | null
  mate: number | null
  loading: boolean
}

/** Clamp cp to [-CLAMP, CLAMP] then map to a 0–100 percentage for the bar. */
const CLAMP = 1000

const cpToPercent = (cp: number): number => {
  const clamped = Math.max(-CLAMP, Math.min(CLAMP, cp))
  return 50 + 50 * (clamped / CLAMP)
}

/** Format the numeric label shown beside the bar. */
function formatLabel(score: number | null, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `#${mate}` : `#${-mate}`
  }
  if (score === null) return '?'
  const pawns = score / 100
  if (pawns > 0) return `+${pawns.toFixed(1)}`
  return pawns.toFixed(1)
}

/**
 * Vertical evaluation bar: white fills from the bottom, black from the top.
 * The numeric score is shown to the right.
 */
export function EvalBar({ score, mate, loading }: EvalBarProps) {
  // Show a pulse skeleton while the engine hasn't returned a result yet.
  if (loading && score === null && mate === null) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-5 rounded bg-gray-300" style={{ height: '140px' }} />
        <div className="h-4 w-10 bg-gray-200 rounded" />
      </div>
    )
  }

  // Determine the white-fill percentage (0 = fully black winning, 100 = fully white winning)
  let whitePercent: number
  if (mate !== null) {
    whitePercent = mate > 0 ? 100 : 0
  } else if (score !== null) {
    whitePercent = cpToPercent(score)
  } else {
    whitePercent = 50
  }

  const label = formatLabel(score, mate)
  const isWhiteAhead = whitePercent >= 50

  return (
    <div className="flex items-center gap-2">
      {/* Bar */}
      <div
        className="relative w-5 rounded overflow-hidden bg-gray-800"
        style={{ height: '140px' }}
        title={`Stockfish eval: ${label}`}
      >
        {/* White fill grows from the bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gray-100 ${loading ? '' : 'transition-all duration-500'}`}
          style={{ height: `${whitePercent}%` }}
        />
      </div>

      {/* Numeric label */}
      <span
        className={`text-sm font-mono font-semibold tabular-nums ${
          loading
            ? 'text-gray-400'
            : isWhiteAhead
              ? 'text-gray-900'
              : 'text-gray-500'
        }`}
      >
        {loading ? '…' : label}
      </span>
    </div>
  )
}
