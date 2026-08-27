import type { MatchCandidate } from '../data/graphEngineData'

/**
 * Strips a candidate's real identity out of freeform copy, pre-match — an SME
 * browsing the queue shouldn't see another merchant's name, only its category.
 */
export function redactCandidateName(
  text: string,
  candidate: Pick<MatchCandidate, 'name' | 'shortName' | 'category'>,
): string {
  const replacement = `the other ${candidate.category.toLowerCase()}`
  return text.split(candidate.name).join(replacement).split(candidate.shortName).join(replacement)
}
