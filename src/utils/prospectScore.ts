import type { ProspectTarget } from '../data/graphEngineData'

function upliftMidpoint(range: string): number {
  const numbers = range.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0]
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

/**
 * How good a bet this prospect is for Amex to recruit, out of 100. Two signals,
 * both already on the prospect: the projected uplift once they join (bigger
 * gap filled, bigger benchmark), and how many merchants are already waiting on
 * them (more merchants confirming the same gap makes the uplift estimate more
 * trustworthy, not just louder).
 */
export function scoreProspect(prospect: ProspectTarget): number {
  const upliftScore = Math.max(0, Math.min(100, upliftMidpoint(prospect.upliftRange) * 3.2))
  const demandScore = Math.max(0, Math.min(100, prospect.waiting.length * 28))
  return Math.round(upliftScore * 0.7 + demandScore * 0.3)
}

/** Best bet for Amex first. */
export function rankProspects<T extends ProspectTarget>(prospects: T[]): T[] {
  return [...prospects].sort((a, b) => scoreProspect(b) - scoreProspect(a))
}
