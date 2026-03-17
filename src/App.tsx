import { useChessGame } from './hooks/useChessGame';
import { useStockfish } from './hooks/useStockfish';
import { BoardPanel } from './components/BoardPanel';
import { PositionInput } from './components/PositionInput';
import { EvalBar } from './components/EvalBar';

export default function App() {
  const game = useChessGame();
  const eval_ = useStockfish(game.fen);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Chess Openings A/B Testing</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Navigate to a position, then compare two candidate moves
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left: Board */}
        <div className="flex-1 min-w-0">
          <BoardPanel game={game} />
        </div>

        {/* Right: Controls */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <PositionInput game={game} />

          {/* Phase 3 — Stockfish evaluation */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Engine Evaluation</h2>
            <EvalBar
              score={eval_.score}
              mate={eval_.mate}
              loading={eval_.loading}
            />
            {eval_.bestMove && !eval_.loading && (
              <p className="mt-2 text-xs text-gray-500">
                Best move: <span className="font-mono font-medium text-gray-700">{eval_.bestMove}</span>
                {' '}(depth {eval_.depth})
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
