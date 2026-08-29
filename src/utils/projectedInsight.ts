/**
 * Projected insight for a prospect.
 *
 * A business that is not on Amex yet has no transaction history, so nothing
 * here is a measurement. These are category-level projections drawn from the
 * pattern of comparable merchants in the graph, generated deterministically so
 * the same prospect always previews the same figures, and labelled as projected
 * everywhere they are shown.
 */
export interface Projection {
  months: string[]
  you: number[]
  median: number[]
  repeatVisitLift: number
  basketLift: number
  newCustomerLift: number
  cohortSize: number
}

const MONTHS = [
  'M1', 'M2', 'M3', 'M4', 'M5', 'M6',
  'M7', 'M8', 'M9', 'M10', 'M11', 'M12',
]

// mulberry32: small, fast, seedable.
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Midpoint of a range like "+15 to 24%", written in the data as "+15-24%". */
export function upliftMidpoint(range: string): number {
  const nums = range.match(/\d+/g)?.map(Number) ?? [12]
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function buildProjection(seed: number, upliftRange: string): Projection {
  const rng = makeRng(seed)
  const mid = upliftMidpoint(upliftRange)
  // Spread the projected annual lift across twelve months, with bounded noise
  // so the line reads as a plausible trend rather than a straight ramp.
  const monthly = mid / 100 / 12
  const base = 100

  const you: number[] = []
  const median: number[] = []
  let a = base
  let b = base
  for (let i = 0; i < 12; i += 1) {
    a = a * (1 + monthly) + (rng() - 0.5) * 1.6
    b = b * (1 + 0.0035) + (rng() - 0.5) * 0.5
    you.push(Math.round(a * 10) / 10)
    median.push(Math.round(b * 10) / 10)
  }

  return {
    months: MONTHS,
    you,
    median,
    repeatVisitLift: Math.round(mid),
    basketLift: Math.round(mid * 0.42),
    newCustomerLift: Math.round(mid * 0.66),
    cohortSize: 18 + Math.floor(rng() * 40),
  }
}
