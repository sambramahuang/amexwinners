import type { PersonalityProfile } from '../data/personalityQuiz'

const AVOID_PENALTY = 20

/**
 * Heuristic, local-only "vibe fit" between a candidate's synthetic personality
 * tags and the anchor merchant's quiz answers. Deliberately simple (no model
 * call) — this is a secondary nudge on top of the real transaction signal,
 * not a score in its own right.
 */
export function computePersonalityFit(candidateTags: string[], profile: PersonalityProfile): number {
  const { likedTags, avoidTags } = profile
  if (likedTags.length === 0 && avoidTags.length === 0) return 50

  const likedMatches = candidateTags.filter((t) => likedTags.includes(t)).length
  const avoidMatches = candidateTags.filter((t) => avoidTags.includes(t)).length

  const base = likedTags.length > 0 ? (likedMatches / likedTags.length) * 100 : 50
  return Math.max(0, Math.min(100, Math.round(base - avoidMatches * AVOID_PENALTY)))
}

/**
 * Blended ranking score: the real closed-loop overlap signal stays dominant
 * (70%); the self-reported personality fit only refines ordering within that.
 */
export function computeBlendedScore(overlapPct: number, personalityFit: number | null): number {
  if (personalityFit === null) return overlapPct
  return overlapPct * 0.7 + personalityFit * 0.3
}
