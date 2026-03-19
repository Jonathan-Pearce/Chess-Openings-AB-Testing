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
    <div className="h-full bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Chess Openings A/B Testing</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Navigate to a position, then compare two candidate moves
        </p>
      </header>

      {/*
        Three-column layout:
          Left  (~25 %) : Set Position + Engine Evaluation + Lichess Stats
          Centre (~25 %) : Main interactive board
          Right  (~50 %) : A column | B column (each ~25 % of total)
      */}
      <main className="flex-1 flex overflow-hidden">
        {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
        <aside className="w-[25%] min-w-[220px] max-w-[300px] border-r border-gray-200 bg-white flex flex-col gap-4 p-4 overflow-y-auto">
          <PositionInput game={game} />
          <MetricsPanel eval_={eval_} lichess={lichess} />
        </aside>

        {/* ── CENTRE: MAIN BOARD ─────────────────────────────────────── */}
        <section className="w-[25%] min-w-[260px] max-w-[420px] flex flex-col justify-start p-4 gap-3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <BoardPanel
            game={game}
            abMode={ab.isABMode}
            onToggleABMode={ab.toggleABMode}
            onCandidateMove={ab.setCandidate}
            onResetCandidates={ab.resetCandidates}
            candidateA={ab.moveA}
            candidateB={ab.moveB}
          />
        </section>

        {/* ── RIGHT: A/B COLUMNS ─────────────────────────────────────── */}
        <section className="flex-1 flex flex-col p-4 overflow-y-auto min-w-0">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 shrink-0">
            Candidate Move Comparison
          </h2>
          <ABTestPanel
            moveA={ab.moveA}
            moveB={ab.moveB}
            currentFen={game.fen}
            legalMoves={ab.legalMoves}
            onSelectMoveA={(san) => ab.setCandidateBySan(san, 'A')}
            onSelectMoveB={(san) => ab.setCandidateBySan(san, 'B')}
            onClearMoveA={() => ab.clearCandidate('A')}
            onClearMoveB={() => ab.clearCandidate('B')}
          />
        </section>
      </main>
    </div>
  );
}
