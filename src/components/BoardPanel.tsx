import { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import type { UseChessGame } from '../hooks/useChessGame';

interface BoardPanelProps {
  game: UseChessGame;
}

export function BoardPanel({ game }: BoardPanelProps) {
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
          game.makeMove(selectedSquare, square);
        }
        setSelectedSquare(null);
        setLegalTargets([]);
      }
    },
    [selectedSquare, legalTargets, game],
  );

  const handleDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!targetSquare) return false;
      setSelectedSquare(null);
      setLegalTargets([]);
      return game.makeMove(sourceSquare, targetSquare);
    },
    [game],
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

