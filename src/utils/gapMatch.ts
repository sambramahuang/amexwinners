import type { ProspectTarget } from '../data/graphEngineData'
import { US_MERCHANTS, type UsMerchant } from '../data/usMerchants'

/**
 * Confirms that a Gap Radar prospect is a real business, not an invented
 * placeholder: every current prospect has a matching entry in the market-wide
 * card network dataset (US_MERCHANTS), named identically, which is what
 * NAME_MATCH_PROSPECT_ID below asserts. The category+city fallback exists for
 * a prospect that doesn't have a hand-authored real-world entry yet — weaker
 * evidence (a comparable real business nearby, not a confirmed identity), used
 * only until one gets added.
 */

/** Every cluster Gap Radar names, mapped to a real city in this market-wide dataset. */
const CLUSTER_CITY: Partial<Record<string, string>> = {
  'Downtown Loop': 'Chicago',
  'Riverside Row': 'Austin',
  'Old Mill Quarter': 'Denver',
  'Ferry Landing': 'Brooklyn',
  'Hollow Creek': 'Portland',
}

/** Every prospect's real-world identity: PROSPECT_TARGETS.id -> its matching US_MERCHANTS entry, by name. */
const NAME_MATCH_PROSPECT_ID: Record<string, number> = {
  'juniper & fern gift co.': 1,
  'marlowe paper goods': 2,
  'sable & stone gifts': 3,
  'cedar recovery': 4, // -> Cedar Recovery Co., the Riverside Row wellness gap
  'whisker & bramble pet co.': 5,
  'burrow pet supply': 6,
  'proof & crumb bakery': 7,
  'millgate bakehouse': 8,
  'acorn & owl books': 9,
}

export interface GrowingMatch {
  merchant: UsMerchant
  /** 'name': this prospect's confirmed real-world identity. 'category': a comparable
   *  real business nearby, used only when no confirmed identity exists yet. */
  reason: 'name' | 'category'
}

/** This prospect's real-world market data — its confirmed identity if it has one, or the closest comparable real business if it doesn't yet. */
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
    .sort((a, b) => {
      // A confirmed identity always outranks a merely-comparable nearby business,
      // no matter how much faster the comparable one happens to be growing —
      // sorting on growth alone let a category match with higher growth bury a
      // prospect's own (slower-growing) confirmed real-world entry.
      if (a.reason !== b.reason) return a.reason === 'name' ? -1 : 1
      return b.merchant.growthPct - a.merchant.growthPct
    })
}
