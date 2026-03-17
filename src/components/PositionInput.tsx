import { useState } from 'react';
import type { UseChessGame } from '../hooks/useChessGame';

interface PositionInputProps {
  game: UseChessGame;
}

export function PositionInput({ game }: PositionInputProps) {
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [fenError, setFenError] = useState<string | null>(null);
  const [pgnError, setPgnError] = useState<string | null>(null);

  const handleFenApply = () => {
    if (!fenInput.trim()) return;
    const result = game.setPositionFromFen(fenInput.trim());
    if (result.success) {
      setFenError(null);
      setFenInput('');
    } else {
      setFenError(result.error ?? 'Invalid FEN');
    }
  };

  const handlePgnApply = () => {
    if (!pgnInput.trim()) return;
    const result = game.setPositionFromPgn(pgnInput.trim());
    if (result.success) {
      setPgnError(null);
      setPgnInput('');
    } else {
      setPgnError(result.error ?? 'Invalid PGN');
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Set Position
      </h3>

      {/* FEN input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="fen-input" className="text-xs font-medium text-gray-600">
          FEN String
        </label>
        <div className="flex gap-2">
          <input
            id="fen-input"
            type="text"
            value={fenInput}
            onChange={(e) => {
              setFenInput(e.target.value);
              setFenError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleFenApply()}
            placeholder="Paste FEN here…"
            className="flex-1 min-w-0 px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
          />
          <button
            onClick={handleFenApply}
            className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Load
          </button>
        </div>
        {fenError && <p className="text-xs text-red-600">{fenError}</p>}
      </div>

      {/* PGN input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="pgn-input" className="text-xs font-medium text-gray-600">
          PGN
        </label>
        <textarea
          id="pgn-input"
          value={pgnInput}
          onChange={(e) => {
            setPgnInput(e.target.value);
            setPgnError(null);
          }}
          placeholder="1. e4 e5 2. Nf3 Nc6 …"
          rows={4}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono resize-y"
        />
        <button
          onClick={handlePgnApply}
          className="self-end px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Load PGN
        </button>
        {pgnError && <p className="text-xs text-red-600">{pgnError}</p>}
      </div>

      {/* Reset */}
      <button
        onClick={game.resetGame}
        className="self-start text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
      >
        Reset to starting position
      </button>
    </div>
  );
}
