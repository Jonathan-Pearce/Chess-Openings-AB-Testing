import { twoProportionZTest, type ZTestResult } from '../utils/statisticalTests'
import type { StockfishState } from '../hooks/useStockfish'
import type { LichessStatsState } from '../hooks/useLichessStats'
import type { CandidateMove } from '../hooks/useABSelection'

export interface AnalysisReportProps {
  moveA: CandidateMove
  moveB: CandidateMove
  evalA: StockfishState
  evalB: StockfishState
  lichessA: LichessStatsState
  lichessB: LichessStatsState
  /** Side to move in the base position ('w' | 'b'). */
  sideToMove: 'w' | 'b'
}

// ─── helpers ────────────────────────────────────────────────────────────────

function sigMarker(result: ZTestResult | null): string {
  if (!result) return ''
  if (result.highlySignificant) return '**'
  if (result.significant) return '*'
  return ''
}

function pctStr(wins: number, total: number): string {
  if (total === 0) return '—'
  return (wins / total * 100).toFixed(1) + '%'
}

function deltaStr(a: number, totalA: number, b: number, totalB: number): string {
  if (totalA === 0 || totalB === 0) return '—'
  const delta = (b / totalB - a / totalA) * 100
  return (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%'
}

function cpStr(score: number | null, mate: number | null): string {
  if (mate !== null) return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`
  if (score === null) return '—'
  return (score >= 0 ? '+' : '') + (score / 100).toFixed(2)
}

function cpDelta(scoreA: number | null, scoreB: number | null): string {
  if (scoreA === null || scoreB === null) return '—'
  const delta = scoreB - scoreA
  return (delta >= 0 ? '+' : '') + (delta / 100).toFixed(2)
}

// ─── recommendation ──────────────────────────────────────────────────────────

function buildRecommendation(
  evalA: StockfishState,
  evalB: StockfishState,
  lichessA: LichessStatsState,
  lichessB: LichessStatsState,
  sideToMove: 'w' | 'b',
  moveA: CandidateMove,
  moveB: CandidateMove,
): string {
  const la = lichessA.data
  const lb = lichessB.data

  // Engine comparison — higher cp = better for white; lower = better for black
  let engineFavors: 'A' | 'B' | null = null
  let engineDetail = ''
  if (evalA.score !== null && evalB.score !== null) {
    const diff = evalB.score - evalA.score
    const threshold = 10 // 0.10 pawn
    if (sideToMove === 'w') {
      if (diff > threshold) engineFavors = 'B'
      else if (diff < -threshold) engineFavors = 'A'
    } else {
      if (diff < -threshold) engineFavors = 'B'
      else if (diff > threshold) engineFavors = 'A'
    }
    engineDetail = `(${cpStr(evalA.score, evalA.mate)} vs ${cpStr(evalB.score, evalB.mate)})`
  }

  // Statistical comparison on side-to-move win rate
  let statFavors: 'A' | 'B' | null = null
  let statDetail = ''
  if (la && lb) {
    const totalA = la.white + la.draws + la.black
    const totalB = lb.white + lb.draws + lb.black
    const winsA = sideToMove === 'w' ? la.white : la.black
    const winsB = sideToMove === 'w' ? lb.white : lb.black
    const test = twoProportionZTest(winsA, totalA, winsB, totalB)
    if (test?.significant) {
      const rateA = pctStr(winsA, totalA)
      const rateB = pctStr(winsB, totalB)
      const marker = test.highlySignificant ? '**' : '*'
      const color = sideToMove === 'w' ? 'white' : 'black'
      if (totalB > 0 && totalA > 0 && winsB / totalB > winsA / totalA) {
        statFavors = 'B'
        statDetail = `Move B has a statistically higher ${color} win rate (${rateB} vs ${rateA}, p=${test.pValue.toFixed(3)}${marker})`
      } else {
        statFavors = 'A'
        statDetail = `Move A has a statistically higher ${color} win rate (${rateA} vs ${rateB}, p=${test.pValue.toFixed(3)}${marker})`
      }
    }
  }

  const loading = evalA.loading || evalB.loading || lichessA.loading || lichessB.loading

  if (loading) {
    return 'Analysis in progress…'
  }

  if (engineFavors && statFavors && engineFavors === statFavors) {
    return `Move ${engineFavors} (${engineFavors === 'A' ? moveA.san : moveB.san}) is recommended. ${statDetail}. Engine eval also favors Move ${engineFavors} ${engineDetail}.`
  }

  if (engineFavors && !statFavors) {
    const hasStats = la && lb
    const suffix = hasStats
      ? ' No statistically significant difference in win rates detected.'
      : ' Opening data unavailable for statistical comparison.'
    return `Move ${engineFavors} (${engineFavors === 'A' ? moveA.san : moveB.san}) appears stronger based on engine evaluation ${engineDetail}.${suffix}`
  }

  if (!engineFavors && statFavors) {
    return `${statDetail}. The engine shows similar evaluation for both moves.`
  }

  if (engineFavors && statFavors && engineFavors !== statFavors) {
    return `The engine favors Move ${engineFavors} ${engineDetail}, but opening statistics favor Move ${statFavors} — ${statDetail}. Consider the trade-off.`
  }

  return 'Both moves appear comparable — no statistically significant difference in win rates, and engine evaluation is similar.'
}

// ─── component ───────────────────────────────────────────────────────────────

export function AnalysisReport({
  moveA,
  moveB,
  evalA,
  evalB,
  lichessA,
  lichessB,
  sideToMove,
}: AnalysisReportProps) {
  const la = lichessA.data
  const lb = lichessB.data

  const totalA = la ? la.white + la.draws + la.black : 0
  const totalB = lb ? lb.white + lb.draws + lb.black : 0

  const whiteTest = la && lb
    ? twoProportionZTest(la.white, totalA, lb.white, totalB)
    : null
  const drawTest = la && lb
    ? twoProportionZTest(la.draws, totalA, lb.draws, totalB)
    : null
  const blackTest = la && lb
    ? twoProportionZTest(la.black, totalA, lb.black, totalB)
    : null

  const loading = evalA.loading || evalB.loading || lichessA.loading || lichessB.loading

  const recommendation = buildRecommendation(
    evalA, evalB, lichessA, lichessB, sideToMove, moveA, moveB,
  )

  type Row = { metric: string; a: string; b: string; delta: string; sig: string }
  const rows: Row[] = [
    {
      metric: 'Engine Eval',
      a: cpStr(evalA.score, evalA.mate),
      b: cpStr(evalB.score, evalB.mate),
      delta: cpDelta(evalA.score, evalB.score),
      sig: '',
    },
    {
      metric: 'White Wins',
      a: la ? pctStr(la.white, totalA) : '—',
      b: lb ? pctStr(lb.white, totalB) : '—',
      delta: la && lb ? deltaStr(la.white, totalA, lb.white, totalB) : '—',
      sig: sigMarker(whiteTest),
    },
    {
      metric: 'Draws',
      a: la ? pctStr(la.draws, totalA) : '—',
      b: lb ? pctStr(lb.draws, totalB) : '—',
      delta: la && lb ? deltaStr(la.draws, totalA, lb.draws, totalB) : '—',
      sig: sigMarker(drawTest),
    },
    {
      metric: 'Black Wins',
      a: la ? pctStr(la.black, totalA) : '—',
      b: lb ? pctStr(lb.black, totalB) : '—',
      delta: la && lb ? deltaStr(la.black, totalA, lb.black, totalB) : '—',
      sig: sigMarker(blackTest),
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistical Analysis</h2>

      {loading ? (
        /* Skeleton while engine / Lichess data is still loading */
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="mt-4 h-14 bg-indigo-100 rounded-md" />
        </div>
      ) : (
        <>
          {/* Delta table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="pb-2 font-medium w-32">Metric</th>
                  <th className="pb-2 font-medium text-blue-600">Move A ({moveA.san})</th>
                  <th className="pb-2 font-medium text-orange-600">Move B ({moveB.san})</th>
                  <th className="pb-2 font-medium text-gray-600">Δ (B−A)</th>
                  <th className="pb-2 font-medium text-gray-600">Sig.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.metric} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-700 font-medium">{row.metric}</td>
                    <td className="py-2 font-mono text-gray-800">{row.a}</td>
                    <td className="py-2 font-mono text-gray-800">{row.b}</td>
                    <td className={`py-2 font-mono font-semibold ${
                      row.delta.startsWith('+') ? 'text-green-600' :
                      row.delta.startsWith('-') ? 'text-red-500' : 'text-gray-400'
                    }`}>{row.delta}</td>
                    <td className="py-2 font-mono text-purple-600 font-semibold">{row.sig || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-1">* p&lt;0.05 &nbsp; ** p&lt;0.01 (two-proportion z-test)</p>
          </div>

          {/* Plain-English recommendation */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-md px-4 py-3">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Recommendation</p>
            <p className="text-sm text-indigo-900">{recommendation}</p>
          </div>
        </>
      )}
    </div>
  )
}
