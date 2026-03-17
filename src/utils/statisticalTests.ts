/**
 * Two-proportion z-test utilities for comparing A/B move statistics.
 */

export interface ZTestResult {
  /** Z-score of the test statistic. */
  zScore: number
  /** Two-tailed p-value. */
  pValue: number
  /** True when p < 0.05. */
  significant: boolean
  /** True when p < 0.01. */
  highlySignificant: boolean
}

/**
 * Two-proportion z-test (two-tailed).
 *
 * H₀: pA = pB  (the two proportions are equal)
 *
 * @param winsA  Number of "successes" for condition A
 * @param totalA Total trials for condition A
 * @param winsB  Number of "successes" for condition B
 * @param totalB Total trials for condition B
 * @returns ZTestResult, or null if the test cannot be run (zero totals / zero SE)
 */
export function twoProportionZTest(
  winsA: number,
  totalA: number,
  winsB: number,
  totalB: number,
): ZTestResult | null {
  if (totalA === 0 || totalB === 0) return null

  const pPooled = (winsA + winsB) / (totalA + totalB)
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / totalA + 1 / totalB))

  if (se === 0) return null

  const pA = winsA / totalA
  const pB = winsB / totalB
  const zScore = (pA - pB) / se
  const pValue = 2 * (1 - normalCdf(Math.abs(zScore)))

  return {
    zScore,
    pValue,
    significant: pValue < 0.05,
    highlySignificant: pValue < 0.01,
  }
}

/** Standard normal CDF via the error function. */
function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

/**
 * Error function approximation (Abramowitz & Stegun, 7.1.26).
 * Maximum error: 1.5 × 10⁻⁷
 */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}
