# Plan: Chess Openings A/B Testing App

**TL;DR** — A Vite + React + TypeScript SPA where users navigate to a chess position (interactively or via FEN/PGN), then click two candidate moves on the board to compare. Each move's resulting position is analyzed with Stockfish evaluation and Lichess opening statistics, a two-proportion z-test surfaces statistical significance, and the app gives a plain-English recommendation. Deployed to GitHub Pages via GitHub Actions.

---

### Phase 1 — Project Scaffolding
1. Initialize Vite React TypeScript project in repo root
2. Install dependencies: `chess.js`, `react-chessboard`, `stockfish` (npm), `tailwindcss`
3. Configure Tailwind CSS
4. Set `base: '/Chess-Openings-AB-Testing/'` in `vite.config.ts` for GitHub Pages pathing
5. Add `.github/workflows/deploy.yml` — build and push to `gh-pages` branch on every push to `main`

### Phase 2 — Chess Board & Game State
6. `useChessGame` hook wrapping chess.js — tracks move history, current FEN, legal moves, undo
7. `<BoardPanel>` — interactive react-chessboard + move history strip
8. `<PositionInput>` — FEN text field + PGN paste field with validation; feeds into `useChessGame`

### Phase 3 — Stockfish Integration
9. `stockfish.worker.ts` Web Worker that speaks UCI; evaluates a FEN at given depth, returns centipawn score + best move
10. `useStockfish` hook — sends FEN to worker, returns `{ score, depth, bestMove, loading }`
11. `<EvalBar>` — visual centipawn bar + numeric score

### Phase 4 — Lichess Opening Explorer API
12. `lichessApi.ts` service — calls `https://explorer.lichess.ovh/lichess?fen=...`, returns win/draw/loss counts, top moves, opening name
13. `useLichessStats` hook — debounced, cancels on FEN change
14. `<OpeningStats>` — opening name, win/draw/loss percentages + bar

### Phase 5 — Current Position Metrics Panel
15. `<MetricsPanel>` — combines `<EvalBar>` + `<OpeningStats>` for the current board position

### Phase 6 — A/B Move Selection & Candidate Metrics
16. "A/B Mode" toggle on the board — first click sets **Move A**, second click sets **Move B** (neither is played on the main board)
17. Compute resulting FEN for each candidate using chess.js without mutating game state
18. Run Stockfish + Lichess stats for each candidate FEN
19. `<CandidateCard>` — mini read-only board + metrics for one candidate move
20. `<ABTestPanel>` — renders two `<CandidateCard>` side by side

### Phase 7 — Statistical Analysis & Recommendation
21. `statisticalTests.ts` — two-proportion z-test: inputs `(winsA, totalA, winsB, totalB)` → p-value + significance flag
22. Apply test to white win rate, black win rate, draw rate; directly compare Stockfish scores
23. `<AnalysisReport>` — metric delta table, significance markers, plain-English recommendation (e.g. *"Move B has a statistically higher white win rate (p=0.03) and a +0.4 eval advantage — Move B is recommended."*)

### Phase 8 — Polish & Deploy
24. Responsive layout (column stack on mobile)
25. Loading skeletons for engine/API calls; error states for offline/invalid FEN/API failure
26. Final deploy verification at `https://jonathan-pearce.github.io/Chess-Openings-AB-Testing/`

---

## Key Files

| File | Purpose |
|---|---|
| `src/hooks/useChessGame.ts` | chess.js wrapper |
| `src/hooks/useStockfish.ts` | Stockfish Web Worker hook |
| `src/hooks/useLichessStats.ts` | Lichess API hook |
| `src/workers/stockfish.worker.ts` | UCI Web Worker |
| `src/services/lichessApi.ts` | Fetch wrapper for Lichess explorer |
| `src/utils/statisticalTests.ts` | Z-test implementation |
| `src/components/BoardPanel.tsx` | Main interactive board |
| `src/components/PositionInput.tsx` | FEN/PGN input |
| `src/components/MetricsPanel.tsx` | Stockfish + Lichess combined view |
| `src/components/ABTestPanel.tsx` | Side-by-side move comparison |
| `src/components/CandidateCard.tsx` | Single move mini-card |
| `src/components/AnalysisReport.tsx` | Stats + recommendation |
| `vite.config.ts` | GitHub Pages base path |
| `.github/workflows/deploy.yml` | CI/CD deploy |

## Verification Checklist
1. Local dev: board renders, moves play interactively
2. FEN input updates the board and eval correctly
3. Stockfish returns ~0 centipawns for the starting position
4. Lichess API returns stats for the position after 1.e4
5. Clicking two moves shows side-by-side `<CandidateCard>` metrics
6. `<AnalysisReport>` flags the clearly better move as "recommended"
7. Deployed GitHub Pages URL loads and functions correctly
