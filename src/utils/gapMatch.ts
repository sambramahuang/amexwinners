import { PROSPECT_TARGETS, type ProspectTarget } from '../data/graphEngineData'
import type { UsMerchant } from '../data/usMerchants'

/**
 * Bridges Growth Radar's market-wide dataset (every business, Amex or not,
 * read from card network and acquiring data) to Gap Radar's dataset (the
 * structural holes the matching graph finds among Amex's own merchants).
 *
 * The two are built from data Amex actually has: matching only sees
 * merchants who already take Amex, so a gap is always found and named
 * there first. Growth Radar then checks the wider market for a specific,
 * already fast-growing business in that same category and cluster's city
 * — there is no transaction or overlap data for a business that has never
 * been an Amex merchant, so that's as far as the evidence goes. Anything
 * beyond a category and city match would be inventing data we don't have.
 */

/** The one cluster Gap Radar names that also has a real city in Growth Radar's dataset. */
const CLUSTER_CITY: Partial<Record<string, string>> = {
  'Downtown Loop': 'Chicago',
}

/**
 * Businesses the two synthetic datasets happen to name identically. A name
 * match is the strongest signal available: it means Growth Radar's
 * independent growth read and Gap Radar's cluster analysis landed on the
 * exact same business without being told to.
 */
const NAME_MATCH_PROSPECT_ID: Record<string, number> = {
  'cedar recovery': 4, // -> Cedar Recovery Co., the Riverside Row wellness gap
}

export interface GapMatch {
  prospect: ProspectTarget
  /** Index into PROSPECT_TARGETS, what RecruitPitchView and App key off of. */
  prospectIdx: number
  /** 'name': the same business was flagged independently by both engines. */
  reason: 'name' | 'category'
}

/** Growth Radar's evidence, if any, that this off-Amex business fills a gap Gap Radar has already found. */
export function findGapMatch(merchant: UsMerchant): GapMatch | null {
  if (merchant.onAmex) return null

  const byName = NAME_MATCH_PROSPECT_ID[merchant.name.toLowerCase()]
  if (byName !== undefined) {
    const prospectIdx = PROSPECT_TARGETS.findIndex((p) => p.id === byName)
    if (prospectIdx >= 0) return { prospect: PROSPECT_TARGETS[prospectIdx], prospectIdx, reason: 'name' }
  }

  const categoryIdx = PROSPECT_TARGETS.findIndex(
    (p) =>
      CLUSTER_CITY[p.cluster] === merchant.city &&
      p.category.toLowerCase() === merchant.category.toLowerCase(),
  )
  if (categoryIdx >= 0) {
    return { prospect: PROSPECT_TARGETS[categoryIdx], prospectIdx: categoryIdx, reason: 'category' }
  }

  return null
}
