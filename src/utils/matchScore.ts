import type { MatchCandidate } from '../data/graphEngineData'

/**
 * Connexion match score, out of 100.
 *
 * Four factors, each scored 0 to 100 and then weighted. Every one is a pure
 * function of data the graph already holds, so a pair always scores the same,
 * and the weights are shown to the merchant rather than hidden.
 */
export interface ScoreFactor {
  key: string
  label: string
  weight: number
  value: number
  detail: string
}

export interface MatchScore {
  total: number
  factors: ScoreFactor[]
}

const ANCHOR_INDUSTRY = 'Café'

// Trades that sit next to a café in a customer's day rather than competing
// with it. Anything unlisted still scores, just lower.
const COMPLEMENTARY: Record<string, number> = {
  Bookstore: 96,
  'Gift shop': 88,
  Florist: 84,
  'Fitness studio': 80,
  'Bike shop': 72,
  Tailor: 58,
  Café: 28,
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function scoreMatch(candidate: MatchCandidate): MatchScore {
  const industry = COMPLEMENTARY[candidate.category] ?? 66
  const customers = clamp(candidate.overlapPct * 2.05)

  // Business value is the joint upside, discounted by how lopsided it is: a
  // partnership where the gain runs one way is the failure mode that sank
  // earlier coalition schemes, so the gap is priced in rather than reported
  // alongside.
  const jointUplift = (candidate.upliftYou + candidate.upliftThem) / 2
  const lopsided = Math.abs(candidate.upliftYou - candidate.upliftThem)
  const value = clamp(jointUplift * 3.4 - lopsided * 2.6)

  // Openness: a merchant who has not opened Connexion in a month, or who ignores
  // approaches, is a worse bet than the raw data suggests.
  const recency = clamp(100 - candidate.lastActiveDays * 2.6)
  const openness = clamp(recency * 0.45 + candidate.responseRate * 0.55)

  const factors: ScoreFactor[] = [
    {
      key: 'customers',
      label: 'Customer profile',
      weight: 0.35,
      value: customers,
      detail: `${candidate.overlapPct}% of their customers also shop with you, measured across the whole base rather than sampled.`,
    },
    {
      key: 'industry',
      label: 'Industry overlap',
      weight: 0.25,
      value: industry,
      detail:
        industry >= 70
          ? `A ${candidate.category.toLowerCase()} sits next to a ${ANCHOR_INDUSTRY.toLowerCase()} in a customer's day without competing for the same sale.`
          : `A ${candidate.category.toLowerCase()} overlaps less naturally with a ${ANCHOR_INDUSTRY.toLowerCase()}, so the pairing has to work harder.`,
    },
    {
      key: 'value',
      label: 'Business value',
      weight: 0.25,
      value,
      detail: `Projected uplift averages ${jointUplift.toFixed(1)} points across both businesses, ${lopsided} points apart. A wider gap is marked down, not just noted.`,
    },
    {
      key: 'openness',
      label: 'Openness to collaborate',
      weight: 0.15,
      value: openness,
      detail: `Last active ${candidate.lastActiveDays} ${candidate.lastActiveDays === 1 ? 'day' : 'days'} ago and replies to ${candidate.responseRate}% of approaches.`,
    },
  ]

  const total = clamp(factors.reduce((sum, f) => sum + f.weight * f.value, 0))
  return { total, factors }
}

/** Plain-language band for the headline number. */
export function scoreBand(total: number): string {
  if (total >= 80) return 'Strong match'
  if (total >= 65) return 'Good match'
  if (total >= 50) return 'Worth a look'
  return 'Weak match'
}

/**
 * Green once the match is worth acting on, blue while it is only worth a
 * look. Colour carries the verdict so the number does not have to be read.
 */
export function scoreTone(total: number): 'good' | 'fair' | 'weak' {
  if (total >= 65) return 'good'
  if (total >= 50) return 'fair'
  return 'weak'
}
