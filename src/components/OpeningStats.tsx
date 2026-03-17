import type { LichessOpeningStats } from '../services/lichessApi'

export interface OpeningStatsProps {
  data: LichessOpeningStats | null
  loading: boolean
  error: string | null
}

function StatBar({ white, draws, black }: { white: number; draws: number; black: number }) {
  const total = white + draws + black
  if (total === 0) return null

  const wPct = (white / total) * 100
  const dPct = (draws / total) * 100
  const bPct = (black / total) * 100

  return (
    <div className="mt-3">
      {/* Stacked bar */}
      <div className="flex h-3 rounded overflow-hidden w-full">
        <div
          className="bg-gray-100 border-r border-gray-300"
          style={{ width: `${wPct}%` }}
          title={`White wins ${wPct.toFixed(1)}%`}
        />
        <div
          className="bg-gray-400"
          style={{ width: `${dPct}%` }}
          title={`Draws ${dPct.toFixed(1)}%`}
        />
        <div
          className="bg-gray-800 border-l border-gray-600"
          style={{ width: `${bPct}%` }}
          title={`Black wins ${bPct.toFixed(1)}%`}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-500 tabular-nums">
        <span>{wPct.toFixed(1)}% W</span>
        <span>{dPct.toFixed(1)}% D</span>
        <span>{bPct.toFixed(1)}% B</span>
      </div>

      <p className="text-xs text-gray-400 mt-0.5 text-right">
        {total.toLocaleString()} games
      </p>
    </div>
  )
}

function TopMoves({ data }: { data: LichessOpeningStats }) {
  if (data.topMoves.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-gray-600 mb-1">Top moves</p>
      <table className="w-full text-xs text-gray-700">
        <thead>
          <tr className="text-gray-400 border-b border-gray-100">
            <th className="text-left pb-1 font-medium">Move</th>
            <th className="text-right pb-1 font-medium">W%</th>
            <th className="text-right pb-1 font-medium">D%</th>
            <th className="text-right pb-1 font-medium">B%</th>
            <th className="text-right pb-1 font-medium">Games</th>
          </tr>
        </thead>
        <tbody>
          {data.topMoves.map((move) => {
            const total = move.white + move.draws + move.black
            if (total === 0) return null
            return (
              <tr key={move.uci} className="border-b border-gray-50">
                <td className="py-0.5 font-mono font-medium">{move.san}</td>
                <td className="text-right py-0.5">{((move.white / total) * 100).toFixed(0)}</td>
                <td className="text-right py-0.5">{((move.draws / total) * 100).toFixed(0)}</td>
                <td className="text-right py-0.5">{((move.black / total) * 100).toFixed(0)}</td>
                <td className="text-right py-0.5">{total.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Displays Lichess opening name, win/draw/loss bar, and top moves table.
 */
export function OpeningStats({ data, loading, error }: OpeningStatsProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-xs text-red-500">
        {error}
      </p>
    )
  }

  if (!data) {
    return <p className="text-xs text-gray-400">No data</p>
  }

  const total = data.white + data.draws + data.black

  return (
    <div>
      {/* Opening name */}
      {data.opening ? (
        <div>
          <span className="text-xs font-semibold text-gray-500 mr-1">{data.opening.eco}</span>
          <span className="text-sm font-medium text-gray-800">{data.opening.name}</span>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">
          {total === 0 ? 'No games found for this position' : 'Unknown opening'}
        </p>
      )}

      <StatBar white={data.white} draws={data.draws} black={data.black} />
      <TopMoves data={data} />
    </div>
  )
}
