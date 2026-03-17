const BASE_URL = 'https://explorer.lichess.ovh/lichess'

export interface LichessTopMove {
  uci: string
  san: string
  white: number
  draws: number
  black: number
  averageRating: number
}

export interface LichessOpening {
  eco: string
  name: string
}

export interface LichessOpeningStats {
  white: number
  draws: number
  black: number
  opening: LichessOpening | null
  topMoves: LichessTopMove[]
}

interface LichessApiResponse {
  white: number
  draws: number
  black: number
  opening?: LichessOpening | null
  moves: LichessTopMove[]
}

/**
 * Fetches opening statistics from the Lichess opening explorer for a given FEN.
 * Queries blitz/rapid/classical games at 2000–2500 rating.
 *
 * @throws on network errors or non-200 responses
 */
export async function fetchLichessStats(
  fen: string,
  signal?: AbortSignal,
): Promise<LichessOpeningStats> {
  // Build the URL manually so the FEN is encoded with %20 for spaces (not +),
  // which is what the Lichess explorer expects.
  const url =
    `${BASE_URL}` +
    `?variant=standard` +
    `&speeds=blitz,rapid,classical` +
    `&ratings=2000,2200,2500` +
    `&fen=${encodeURIComponent(fen)}`

  console.debug('[lichessApi] GET', url)

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = import.meta.env.VITE_LICHESS_TOKEN
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { signal, headers })

  if (!response.ok) {
    throw new Error(`Lichess API error: ${response.status} ${response.statusText}`)
  }

  const data: LichessApiResponse = await response.json()

  return {
    white: data.white,
    draws: data.draws,
    black: data.black,
    opening: data.opening ?? null,
    topMoves: (data.moves ?? []).slice(0, 3),
  }
}
