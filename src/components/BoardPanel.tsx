import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import type { UseChessGame } from '../hooks/useChessGame';
import type { CandidateMove } from '../hooks/useABSelection';

interface BoardPanelProps {
  game: UseChessGame;
  abMode: boolean;
  onToggleABMode: () => void;
  onCandidateMove: (from: string, to: string) => void;
  onResetCandidates: () => void;
  candidateA: CandidateMove | null;
  candidateB: CandidateMove | null;
}

export function BoardPanel({ game, abMode, onToggleABMode, onCandidateMove, onResetCandidates, candidateA, candidateB }: BoardPanelProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  const squareStyles: Record<string, React.CSSProperties> = {};

  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
  }
  legalTargets.forEach((sq) => {
    squareStyles[sq] = {
      background: 'radial-gradient(circle, rgba(0,0,0,.15) 25%, transparent 25%)',
      borderRadius: '50%',
    };
  });

  // Highlight candidate A squares (blue)
  if (candidateA) {
    squareStyles[candidateA.from] = { backgroundColor: 'rgba(59, 130, 246, 0.35)' };
    squareStyles[candidateA.to] = { backgroundColor: 'rgba(59, 130, 246, 0.6)' };
  }
  // Highlight candidate B squares (orange)
  if (candidateB) {
    squareStyles[candidateB.from] = { backgroundColor: 'rgba(249, 115, 22, 0.35)' };
    squareStyles[candidateB.to] = { backgroundColor: 'rgba(249, 115, 22, 0.6)' };
  }

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (selectedSquare === null) {
        const targets = game.getLegalTargets(square);
        if (targets.length > 0) {
          setSelectedSquare(square);
          setLegalTargets(targets);
        }
      } else {
        if (legalTargets.includes(square)) {
          if (abMode) {
            onCandidateMove(selectedSquare, square);
          } else {
            game.makeMove(selectedSquare, square);
          }
        }
        setSelectedSquare(null);
        setLegalTargets([]);
      }
    },
    [selectedSquare, legalTargets, game, abMode, onCandidateMove],
  );

  const handleDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      setSelectedSquare(null);
      setLegalTargets([]);
      if (abMode) {
        onCandidateMove(sourceSquare, targetSquare);
        return false; // keep the piece at its original square
      }
      return game.makeMove(sourceSquare, targetSquare);
    },
    [game, abMode, onCandidateMove],
  );

  // Group moves into pairs: ["1. e4 e5", "2. Nf3 Nc6", ...]
  const movePairs = game.history.reduce<string[]>((pairs, move, i) => {
    if (i % 2 === 0) {
      pairs.push(`${Math.floor(i / 2) + 1}. ${move}`);
    } else {
      pairs[pairs.length - 1] += ` ${move}`;
    }
    return pairs;
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* A/B Mode toggle + status banner */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onToggleABMode}
          className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
            abMode
              ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {abMode ? 'A/B Mode: ON' : 'A/B Mode: OFF'}
        </button>

        {abMode && (
          <>
            <span className="text-sm text-gray-600">
              {!candidateA && !candidateB && 'Click a piece + square to set Move A'}
              {candidateA && !candidateB && (
                <>
                  <span className="font-mono font-semibold text-blue-600">{candidateA.san}</span>
                  {' '}registered as Move A — now set Move B
                </>
              )}
              {candidateA && candidateB && (
                <>
                  <span className="font-mono font-semibold text-blue-600">{candidateA.san}</span>
                  {' vs '}
                  <span className="font-mono font-semibold text-orange-600">{candidateB.san}</span>
                  {' — both moves set'}
                </>
              )}
            </span>
            {(candidateA || candidateB) && (
              <button
                onClick={onResetCandidates}
                className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            )}
          </>
        )}
      </div>

      <div className="w-full max-w-[520px] mx-auto">
        <Chessboard
          options={{
            position: game.fen,
            onPieceDrop: handleDrop,
            onSquareClick: handleSquareClick,
            squareStyles,
            allowDrawingArrows: true,
          }}
        />
      </div>

      {/* Turn / status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div
          className={`w-3 h-3 rounded-full border border-gray-400 ${
            game.turn === 'w' ? 'bg-white' : 'bg-gray-900'
          }`}
        />
        <span>{game.turn === 'w' ? 'White' : 'Black'} to move</span>
        {game.isCheck && !game.isGameOver && (
          <span className="text-red-600 font-semibold ml-1">Check!</span>
        )}
        {game.isGameOver && (
          <span className="text-red-600 font-semibold ml-1">Game over</span>
        )}
      </div>

      {/* Move history strip */}
      {movePairs.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 max-h-28 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono leading-relaxed">
          {movePairs.map((pair, i) => (
            <span key={i} className="text-gray-700 whitespace-nowrap">
              {pair}
            </span>
          ))}
        </div>
      )}

      {/* Undo */}
      {game.history.length > 0 && (
        <button
          onClick={game.undoMove}
          className="self-start px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
        >
          ← Undo
        </button>
      )}
    </div>
  );
}

