import { useState } from 'react'
import { MetricsPanel } from './MetricsPanel'
import { MoveSelectorModal } from './MoveSelectorModal'
import type { CandidateMove } from '../hooks/useABSelection'
import type { StockfishState } from '../hooks/useStockfish'
import type { LichessStatsState } from '../hooks/useLichessStats'
import type { Move } from 'chess.js'

export interface CandidateCardProps {
  label: 'A' | 'B'
  candidate: CandidateMove | null
  eval_: StockfishState
  lichess: LichessStatsState
  currentFen: string
  legalMoves: Move[]
  onSelectMove: (san: string) => void
  onClearMove: () => void
}

/**
 * Displays move-selector controls (dropdown + visual-board button) and, once a
 * candidate is chosen, its mini read-only board and Stockfish / Lichess metrics.
 */
export function CandidateCard({
  label,
  candidate,
  eval_,
  lichess,
  currentFen,
  legalMoves,
  onSelectMove,
  onClearMove,
}: CandidateCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const borderColor = label === 'A' ? 'border-blue-300' : 'border-orange-300'
  const bgColor = label === 'A' ? 'bg-blue-50' : 'bg-orange-50'
  const accentBadge = label === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
  const accentText = label === 'A' ? 'text-blue-700' : 'text-orange-700'
  const accentEmpty = label === 'A' ? 'text-blue-300' : 'text-orange-300'

  return (
    <div className={`rounded-lg border-2 ${borderColor} ${bgColor} p-3 flex flex-col gap-3 overflow-y-auto`}>
      {/* Column header */}
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${accentBadge}`}>Move {label}</span>
        {candidate && (
          <span className={`font-mono text-sm font-semibold ${accentText}`}>{candidate.san}</span>
        )}
      </div>

      {/* Selector controls */}
      <div className="flex gap-2">
        <select
          value={candidate?.san ?? ''}
          onChange={(e) => {
            const val = e.target.value
            if (val) onSelectMove(val)
            else onClearMove()
          }}
          className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">— pick a move —</option>
          {legalMoves.map((m) => (
            <option key={m.san} value={m.san}>
              {m.san}
            </option>
          ))}
        </select>

        <button
          onClick={() => setModalOpen(true)}
          title="Select move visually on a board"
          className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          ♟ Board
        </button>

        {candidate && (
          <button
            onClick={onClearMove}
            title="Clear selection"
            className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors text-gray-500"
          >
            ✕
          </button>
        )}
      </div>

      {/* Candidate content or placeholder */}
      {candidate ? (
        <div className="flex flex-col gap-3">
          <MetricsPanel eval_={eval_} lichess={lichess} horizontalEval hideOpeningStats />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className={`text-5xl font-black ${accentEmpty}`}>{label}</span>
          <p className="text-xs text-gray-400 text-center">
            Pick a move from the dropdown or click ♟&nbsp;Board
          </p>
        </div>
      )}

      {/* Visual board selection modal */}
      {modalOpen && (
        <MoveSelectorModal
          currentFen={currentFen}
          label={label}
          onConfirm={(san) => {
            onSelectMove(san)
            setModalOpen(false)
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
