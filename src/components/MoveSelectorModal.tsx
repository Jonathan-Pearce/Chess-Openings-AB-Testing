import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { SquareHandlerArgs } from 'react-chessboard'

interface PendingMove {
  from: string
  to: string
  san: string
  resultFen: string
}

interface MoveSelectorModalProps {
  currentFen: string
  label: 'A' | 'B'
  onConfirm: (san: string) => void
  onClose: () => void
}

export function MoveSelectorModal({ currentFen, label, onConfirm, onClose }: MoveSelectorModalProps) {
  const [pending, setPending] = useState<PendingMove | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalTargets, setLegalTargets] = useState<string[]>([])

  const accentFrom = label === 'A' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(249, 115, 22, 0.4)'
  const accentTo = label === 'A' ? 'rgba(59, 130, 246, 0.7)' : 'rgba(249, 115, 22, 0.7)'

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.5)' }
  }
  legalTargets.forEach((sq) => {
    squareStyles[sq] = {
      background: 'radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)',
      borderRadius: '50%',
    }
  })
  if (pending) {
    squareStyles[pending.from] = { backgroundColor: accentFrom }
    squareStyles[pending.to] = { backgroundColor: accentTo }
  }

  // Show the resulting position when a move is pending, otherwise the base position.
  const displayFen = pending ? pending.resultFen : currentFen

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (selectedSquare === null) {
        const clone = new Chess(currentFen)
        const targets = clone
          .moves({ square: square as Square, verbose: true })
          .map((m) => m.to as string)
        if (targets.length > 0) {
          setSelectedSquare(square)
          setLegalTargets(targets)
          setPending(null)
        }
      } else {
        if (legalTargets.includes(square)) {
          const clone = new Chess(currentFen)
          try {
            const result = clone.move({ from: selectedSquare, to: square, promotion: 'q' })
            if (result) {
              setPending({ from: selectedSquare, to: square, san: result.san, resultFen: clone.fen() })
            }
          } catch {
            // invalid move — ignore
          }
        }
        setSelectedSquare(null)
        setLegalTargets([])
      }
    },
    [selectedSquare, legalTargets, currentFen],
  )

  const badgeClass = label === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'

  // Prevent board re-mounting when squareStyles changes by keeping options stable.
  const boardOptions = useMemo(
    () => ({
      position: displayFen,
      onSquareClick: handleSquareClick,
      squareStyles,
      allowDrawingArrows: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayFen, handleSquareClick, JSON.stringify(squareStyles)],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-5 w-[420px] max-w-[92vw] flex flex-col gap-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeClass}`}>Move {label}</span>
            <h3 className="text-sm font-semibold text-gray-800">Select move on board</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Board */}
        <div className="w-full">
          <Chessboard options={boardOptions} />
        </div>

        {/* Status */}
        <p className="text-sm text-gray-500 min-h-[1.25rem]">
          {pending ? (
            <>
              Selected:{' '}
              <span className="font-mono font-semibold text-gray-800">{pending.san}</span>
              {' — click another piece to change, or click OK to confirm.'}
            </>
          ) : selectedSquare ? (
            'Click a destination square.'
          ) : (
            'Click a piece to see its legal moves.'
          )}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => pending && onConfirm(pending.san)}
            disabled={!pending}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            OK — use {pending?.san ?? '…'}
          </button>
        </div>
      </div>
    </div>
  )
}
