import { useState, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';

export interface GameSnapshot {
  fen: string;
  history: string[];
  turn: 'w' | 'b';
  isGameOver: boolean;
  isCheck: boolean;
}

export interface UseChessGame extends GameSnapshot {
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  undoMove: () => void;
  setPositionFromFen: (fen: string) => { success: boolean; error?: string };
  setPositionFromPgn: (pgn: string) => { success: boolean; error?: string };
  resetGame: () => void;
  getLegalTargets: (square: string) => string[];
}

function getSnapshot(chess: Chess): GameSnapshot {
  return {
    fen: chess.fen(),
    history: chess.history(),
    turn: chess.turn() as 'w' | 'b',
    isGameOver: chess.isGameOver(),
    isCheck: chess.isCheck(),
  };
}

export function useChessGame(): UseChessGame {
  // Stable mutable chess instance — we mutate it then call refresh() to re-render.
  const [chess] = useState(() => new Chess());
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => getSnapshot(chess));

  const refresh = useCallback(() => setSnapshot(getSnapshot(chess)), [chess]);

  const makeMove = useCallback(
    (from: string, to: string, promotion = 'q'): boolean => {
      try {
        const result = chess.move({ from, to, promotion });
        if (result) {
          refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [chess, refresh],
  );

  const undoMove = useCallback(() => {
    chess.undo();
    refresh();
  }, [chess, refresh]);

  const setPositionFromFen = useCallback(
    (fen: string): { success: boolean; error?: string } => {
      try {
        chess.load(fen);
        refresh();
        return { success: true };
      } catch {
        return { success: false, error: 'Invalid FEN string' };
      }
    },
    [chess, refresh],
  );

  const setPositionFromPgn = useCallback(
    (pgn: string): { success: boolean; error?: string } => {
      try {
        chess.loadPgn(pgn);
        refresh();
        return { success: true };
      } catch {
        return { success: false, error: 'Invalid PGN' };
      }
    },
    [chess, refresh],
  );

  const resetGame = useCallback(() => {
    chess.reset();
    refresh();
  }, [chess, refresh]);

  const getLegalTargets = useCallback(
    (square: string): string[] =>
      chess
        .moves({ square: square as Square, verbose: true })
        .map((m) => m.to as string),
    [chess],
  );

  return {
    ...snapshot,
    makeMove,
    undoMove,
    setPositionFromFen,
    setPositionFromPgn,
    resetGame,
    getLegalTargets,
  };
}
