import { useChessGame } from './hooks/useChessGame';
import { useStockfish } from './hooks/useStockfish';
import { useLichessStats } from './hooks/useLichessStats';
import { useABSelection } from './hooks/useABSelection';
import { BoardPanel } from './components/BoardPanel';
import { PositionInput } from './components/PositionInput';
import { MetricsPanel } from './components/MetricsPanel';
import { ABTestPanel } from './components/ABTestPanel';

export default function App() {
  const game = useChessGame();
  const eval_ = useStockfish(game.fen);
  const lichess = useLichessStats(game.fen);
  const ab = useABSelection(game);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Chess Openings A/B Testing</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Navigate to a position, then compare two candidate moves
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Top section: board + current position metrics */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Board */}
          <div className="flex-1 min-w-0">
            <BoardPanel
              game={game}
              abMode={ab.isABMode}
              onToggleABMode={ab.toggleABMode}
              onCandidateMove={ab.setCandidate}
              onResetCandidates={ab.resetCandidates}
              candidateA={ab.moveA}
              candidateB={ab.moveB}
            />
          </div>

          {/* Right: Position input + current position metrics */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <PositionInput game={game} />
            <MetricsPanel eval_={eval_} lichess={lichess} />
          </div>
        </div>

        {/* A/B candidate comparison — shown whenever A/B mode is active */}
        {ab.isABMode && (
          <ABTestPanel moveA={ab.moveA} moveB={ab.moveB} />
        )}
      </main>
    </div>
  );
}
