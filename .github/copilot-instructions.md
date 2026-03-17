# Copilot Instructions — Chess Openings A/B Testing App

## Project Overview
A Vite + React + TypeScript SPA hosted on GitHub Pages. Users navigate to a chess position (interactively or by pasting a FEN/PGN), then click two candidate moves to compare. Each candidate is evaluated with Stockfish and Lichess opening statistics, and a two-proportion z-test determines which move is statistically better. A plain-English recommendation is shown.

## Tech Stack
- **Framework:** Vite + React + TypeScript
- **Chess board UI:** `react-chessboard`
- **Chess logic / move validation:** `chess.js`
- **Engine:** `stockfish` npm package, run as a Web Worker (UCI protocol)
- **Opening data:** Lichess Opening Explorer REST API — `https://explorer.lichess.ovh/lichess`
- **Styling:** Tailwind CSS (no heavy component library)
- **Deployment:** GitHub Actions → GitHub Pages (`gh-pages` branch)

## Repository Layout
```
src/
  components/
    BoardPanel.tsx        # Interactive main board + move history strip
    PositionInput.tsx     # FEN text field + PGN paste field
    EvalBar.tsx           # Centipawn evaluation bar
    OpeningStats.tsx      # Win/draw/loss stats from Lichess
    MetricsPanel.tsx      # EvalBar + OpeningStats for current position
    ABTestPanel.tsx       # Side-by-side CandidateCard pair
    CandidateCard.tsx     # Mini read-only board + metrics for one candidate move
    AnalysisReport.tsx    # Delta table, significance markers, recommendation
  hooks/
    useChessGame.ts       # chess.js wrapper — FEN, move history, undo, legal moves
    useStockfish.ts       # Web Worker hook — returns { score, depth, bestMove, loading }
    useLichessStats.ts    # Debounced Lichess API hook — returns win/draw/loss + topMoves
  workers/
    stockfish.worker.ts   # UCI Web Worker wrapping the stockfish npm package
  services/
    lichessApi.ts         # fetch() wrapper for explorer.lichess.ovh
  utils/
    statisticalTests.ts   # Two-proportion z-test utility
  App.tsx
  main.tsx
.github/
  workflows/
    deploy.yml            # Build + deploy to gh-pages on push to main
  copilot-instructions.md
vite.config.ts            # base: '/Chess-Openings-AB-Testing/'
```

## Coding Conventions
- Use **functional React components** with hooks only — no class components.
- All components and hooks must be **fully typed** with TypeScript; avoid `any`.
- Prefer **named exports** for components and hooks; default export only for `App`.
- Keep **business logic out of components** — put it in hooks or utils.
- Tailwind utility classes only — no inline `style` props and no custom CSS files unless unavoidable.
- All async data fetching goes through hooks (`useLichessStats`, `useStockfish`); components are purely presentational.
- Do **not** mutate the `chess.js` game instance to compute candidate FENs — use a temporary cloned instance.

## Key Behaviours
### Position Setup
- The main board supports both interactive move play (click/drag pieces) and direct FEN or PGN text input.
- Entering a valid FEN or PGN replaces the current board position; invalid input shows an inline error.

### A/B Mode
- A toggle switches the board into "A/B selection" mode.
- In this mode, the first legal square click registers **Move A**; a second legal square click registers **Move B**.
- Neither move is applied to the main game — the board stays at the current position.
- Each candidate FEN is computed by cloning the chess.js instance and applying the candidate move.

### Metrics Per Position (current + each candidate)
- **Stockfish eval:** centipawn score at depth 18, shown as a bar and numeric value.
- **Lichess stats:** total games, white win %, draw %, black win %, opening name (if known), top 3 engine moves with game counts.

### Statistical Analysis
- Use a **two-proportion z-test** (α = 0.05) on white win rate, black win rate, and draw rate.
- Flag metrics as statistically significant with `*` (p < 0.05) or `**` (p < 0.01).
- The `<AnalysisReport>` recommendation prefers the move with the higher Stockfish score **and** significantly better win rate for the side to move; if they conflict, note the trade-off.

### Stockfish Web Worker (UCI)
- Send `uci`, wait for `uciok`.
- Send `isready`, wait for `readyok`.
- Send `position fen <fen>` then `go depth 18`.
- Parse `info depth 18 ... score cp <n>` (or `score mate <n>`) from output lines.
- Send `stop` before sending a new position if analysis is in progress.

### Lichess API
- Endpoint: `GET https://explorer.lichess.ovh/lichess?variant=standard&speeds=blitz,rapid,classical&ratings=2000,2200,2500&fen=<encoded-fen>`
- Rate-limit: max 1 request per second — debounce with a 500 ms delay.
- On network error or non-200 response, show an error state in `<OpeningStats>` without crashing.

## GitHub Pages Deployment
- `vite.config.ts` must have `base: '/Chess-Openings-AB-Testing/'`.
- The deploy workflow uses `actions/checkout`, `actions/setup-node`, runs `npm ci && npm run build`, then deploys `dist/` to the `gh-pages` branch.
- The live URL is `https://jonathan-pearce.github.io/Chess-Openings-AB-Testing/`.

## Things to Avoid
- Do not store API keys or secrets in source code — the Lichess explorer API is public and requires no auth.
- Do not run Stockfish on the main thread — always use the Web Worker.
- Do not fetch Lichess stats on every keystroke or render — use debouncing.
- Do not add dependencies beyond what is listed in the tech stack without a clear reason.
