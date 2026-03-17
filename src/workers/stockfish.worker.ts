/**
 * StockfishWorker — manages the stockfish-18-lite-single.js Web Worker.
 *
 * The stockfish npm package ships a self-contained Emscripten bundle that runs
 * as a classic Web Worker and speaks UCI over postMessage/onmessage.
 * This class creates that worker from the public base URL, drives the UCI
 * handshake, and exposes a simple evaluate() / stop() / terminate() API.
 */

export interface EvalResult {
  /** Centipawn score from the side to move's perspective (null when forced mate). */
  score: number | null;
  /** Moves to mate: positive = side to move wins, negative = side to move loses (null when not a forced mate). */
  mate: number | null;
  /** Search depth that produced this result. */
  depth: number;
  /** Best move in UCI notation (e.g. "e2e4"), or null before the search completes. */
  bestMove: string | null;
}

export type EvalCallback = (result: EvalResult) => void;

export class StockfishWorker {
  private readonly worker: Worker;
  private ready = false;
  private analyzing = false;

  /** Most recent partial result accumulated from info lines. */
  private partial: Partial<EvalResult> = {};

  /** Queued evaluation to run as soon as the engine signals readyok. */
  private pendingFen: string | null = null;
  private pendingDepth = 18;

  private callback: EvalCallback | null = null;

  /**
   * @param baseUrl  Value of `import.meta.env.BASE_URL` — ensures the correct
   *                 path in both dev (`/`) and GitHub Pages
   *                 (`/Chess-Openings-AB-Testing/`).
   */
  constructor(baseUrl: string) {
    this.worker = new Worker(`${baseUrl}stockfish-18-lite-single.js`)
    this.worker.onmessage = (e: MessageEvent<string>) => this.handleMessage(e.data)
    this.worker.postMessage('uci')
  }

  private handleMessage(line: string): void {
    if (line === 'uciok') {
      this.worker.postMessage('isready')
      return
    }

    if (line === 'readyok') {
      this.ready = true
      if (this.pendingFen !== null) {
        this.startSearch(this.pendingFen, this.pendingDepth)
        this.pendingFen = null
      }
      return
    }

    if (line.startsWith('info')) {
      const depthMatch = line.match(/\bdepth\s+(\d+)/)
      const cpMatch = line.match(/\bscore cp\s+(-?\d+)/)
      const mateMatch = line.match(/\bscore mate\s+(-?\d+)/)
      const pvMatch = line.match(/\bpv\s+(\S+)/)

      if (depthMatch) {
        const depth = parseInt(depthMatch[1], 10)
        if (cpMatch ?? mateMatch) {
          this.partial = {
            depth,
            score: cpMatch ? parseInt(cpMatch[1], 10) : null,
            mate: mateMatch ? parseInt(mateMatch[1], 10) : null,
            bestMove: pvMatch ? pvMatch[1] : (this.partial.bestMove ?? null),
          }
        }
      }
      return
    }

    if (line.startsWith('bestmove')) {
      this.analyzing = false
      const bmMatch = line.match(/^bestmove\s+(\S+)/)
      const result: EvalResult = {
        score: this.partial.score ?? null,
        mate: this.partial.mate ?? null,
        depth: this.partial.depth ?? 0,
        bestMove: bmMatch ? bmMatch[1] : null,
      }
      this.callback?.(result)
    }
  }

  private startSearch(fen: string, depth: number): void {
    if (this.analyzing) {
      this.worker.postMessage('stop')
    }
    this.analyzing = true
    this.partial = {}
    this.worker.postMessage(`position fen ${fen}`)
    this.worker.postMessage(`go depth ${depth}`)
  }

  /**
   * Request an evaluation of `fen` at `depth` half-moves.
   * If called while a previous search is running, that search is stopped first.
   * If the engine is not yet ready, the request is queued.
   */
  evaluate(fen: string, depth: number, callback: EvalCallback): void {
    this.callback = callback
    if (!this.ready) {
      this.pendingFen = fen
      this.pendingDepth = depth
    } else {
      this.startSearch(fen, depth)
    }
  }

  /** Halt the current search without terminating the worker. */
  stop(): void {
    if (this.analyzing) {
      this.worker.postMessage('stop')
      this.analyzing = false
    }
  }

  /** Permanently shut down the worker. */
  terminate(): void {
    this.worker.postMessage('quit')
    this.worker.terminate()
  }
}
