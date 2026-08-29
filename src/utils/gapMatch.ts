import type { ProspectTarget } from '../data/graphEngineData'
import { US_MERCHANTS, type UsMerchant } from '../data/usMerchants'

/**
 * Bridges Gap Radar's dataset (structural holes found among Amex's own
 * merchants) to market-wide card network data: for a gap Gap Radar has
 * already named, which real, currently-growing businesses — Amex merchant
 * or not — could actually fill it. Gap Radar's own prospect is always one
 * hand-picked example; this is evidence beyond that one pick, from data
 * Amex actually has. A business already on Amex is excluded since it isn't
 * a recruit target.
 */

/** The one cluster Gap Radar names that also has a real city in this market-wide dataset. */
const CLUSTER_CITY: Partial<Record<string, string>> = {
  'Downtown Loop': 'Chicago',
}

/** Businesses the two synthetic datasets happen to name identically — the strongest signal available. */
const NAME_MATCH_PROSPECT_ID: Record<string, number> = {
  'cedar recovery': 4, // -> Cedar Recovery Co., the Riverside Row wellness gap
}

export interface GrowingMatch {
  merchant: UsMerchant
  /** 'name': the same business was flagged independently by both engines. */
  reason: 'name' | 'category'
}

/** Real, currently-growing businesses that could fill this prospect's gap, ranked by growth. */
export function findGrowingMatches(prospect: ProspectTarget): GrowingMatch[] {
  const city = CLUSTER_CITY[prospect.cluster]

  return US_MERCHANTS.filter((m) => !m.onAmex)
    .map((merchant): GrowingMatch | null => {
      if (NAME_MATCH_PROSPECT_ID[merchant.name.toLowerCase()] === prospect.id) {
        return { merchant, reason: 'name' }
      }
      if (city === merchant.city && merchant.category.toLowerCase() === prospect.category.toLowerCase()) {
        return { merchant, reason: 'category' }
      }
      return null
    })
    .filter((m): m is GrowingMatch => m !== null)
    .sort((a, b) => b.merchant.growthPct - a.merchant.growthPct)
}
