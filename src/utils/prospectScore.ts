import type { ProspectTarget } from '../data/graphEngineData'
import { findGrowingMatches } from './gapMatch'

function upliftMidpoint(range: string): number {
  const numbers = range.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0]
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export interface ProspectScoreFactor {
  key: string
  label: string
  weight: number
  value: number
  detail: string
}

export interface ProspectScoreBreakdown {
  total: number
  factors: ProspectScoreFactor[]
}

/**
 * How good a bet this prospect is for Amex to recruit, out of 100, broken into
 * the three signals that make it up: the projected uplift once they join, how
 * many merchants are already waiting on them (more merchants confirming the same
 * gap makes the uplift estimate more trustworthy, not just louder), and whether
 * this prospect is a confirmed real, currently-growing business in the
 * market-wide growth dataset — evidence beyond Amex's own graph, not just a
 * name Gap Radar invented.
 */
export function scoreProspectBreakdown(prospect: ProspectTarget): ProspectScoreBreakdown {
  const upliftScore = clamp(upliftMidpoint(prospect.upliftRange) * 3.2)
  const demandScore = clamp(prospect.waiting.length * 28)

  const growing = findGrowingMatches(prospect)
  const bestGrowth = growing[0]?.merchant.growthPct
  // A real business growing fast is stronger confirmation than one growing slowly,
  // so this scales with the rate itself rather than just "found one or not" — but
  // even a modest match still clearly beats no independent confirmation at all.
  const growthScore = bestGrowth === undefined ? 12 : clamp(30 + bestGrowth * 0.9)

  const factors: ProspectScoreFactor[] = [
    {
      key: 'uplift',
      label: 'Projected uplift',
      weight: 0.5,
      value: upliftScore,
      detail: `${prospect.upliftRange} projected lift in repeat visits once this gap is filled — a category benchmark drawn from comparable clusters, not a live measurement.`,
    },
    {
      key: 'demand',
      label: 'Confirmed demand',
      weight: 0.25,
      value: demandScore,
      detail: `${prospect.waiting.length} merchant${prospect.waiting.length === 1 ? '' : 's'} in ${prospect.cluster} already show strong customer overlap with this missing category.`,
    },
    {
      key: 'growth',
      label: 'Real-world growth signal',
      weight: 0.25,
      value: growthScore,
      detail:
        bestGrowth === undefined
          ? `No real-world confirmation exists for this prospect yet — this pick rests on the graph signal alone.`
          : growing[0].reason === 'name'
            ? `${prospect.name} is a real business, confirmed in market-wide card network data, currently growing at +${bestGrowth}% over 12 months — independent confirmation beyond Amex's own graph.`
            : `No confirmed real-world entry yet, but a comparable real business (${growing[0].merchant.name}) is growing at +${bestGrowth}% nearby — weaker evidence, but still independent of Amex's own graph.`,
    },
  ]

  const total = clamp(factors.reduce((sum, f) => sum + f.weight * f.value, 0))
  return { total, factors }
}

export function scoreProspect(prospect: ProspectTarget): number {
  return scoreProspectBreakdown(prospect).total
}

/** Plain-language band for the headline number. */
export function prospectScoreBand(total: number): string {
  if (total >= 75) return 'Strong recruit'
  if (total >= 55) return 'Good bet'
  if (total >= 40) return 'Worth a look'
  return 'Speculative'
}

/** Best bet for Amex first. */
export function rankProspects<T extends ProspectTarget>(prospects: T[]): T[] {
  return [...prospects].sort((a, b) => scoreProspect(b) - scoreProspect(a))
}
