// -----------------------------------------------------------------------
// SYNTHETIC DEMO DATA
// The region's fastest-growing small and medium merchants. Deliberately a
// mix of businesses already accepting Amex and ones that are not: growth is
// read from card-network and acquiring data across the region, so the radar
// sees a business before it is a customer. That is the whole point of the
// screen, and it is what makes it an acquisition tool as well as a portfolio
// one.
// -----------------------------------------------------------------------

export interface GrowingMerchant {
  id: number
  name: string
  category: string
  cluster: string
  /** 12-month growth in card volume, percent. */
  growthPct: number
  volumeBand: string
  onAmex: boolean
  /** 12 monthly index points, for the sparkline. */
  series: number[]
}

function series(start: number, growth: number, seed: number): number[] {
  const out: number[] = []
  let v = start
  let s = seed
  for (let i = 0; i < 12; i += 1) {
    // Deterministic wobble, so a merchant's line is stable across renders.
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const noise = ((s / 0x7fffffff) - 0.5) * start * 0.05
    v = v * (1 + growth / 100 / 12) + noise
    out.push(Math.round(v * 10) / 10)
  }
  return out
}

const RAW: [string, string, string, number, string, boolean][] = [
  ['Salt & Barrel', 'Restaurant', 'Harbor District', 71, '$50k to $200k', true],
  ['Juniper & Fern Gift Co.', 'Gift shop', 'Downtown Loop', 64, '$10k to $50k', false],
  ['Halcyon Records', 'Record shop', 'Meridian Heights', 58, '$10k to $50k', true],
  ['Cedar Recovery Co.', 'Wellness', 'Riverside Row', 55, '$10k to $50k', false],
  ['Anchorline Brewing', 'Brewery', 'Harbor District', 52, '$200k+', true],
  ['Marlowe Paper Goods', 'Stationery', 'Downtown Loop', 49, 'Under $10k', false],
  ['Ridgeline Yoga Studio', 'Fitness studio', 'Riverside Row', 47, '$10k to $50k', true],
  ['Loft & Ladder', 'Furniture', 'Meridian Heights', 44, '$200k+', true],
  ['Sable & Stone Gifts', 'Home & gift', 'Downtown Loop', 41, '$10k to $50k', false],
  ['Tidewater Butchery', 'Butcher', 'Harbor District', 39, '$50k to $200k', true],
  ['Basin Coffee Roasters', 'Café', 'Downtown Loop', 36, '$50k to $200k', true],
  ['Cinder & Slate', 'Kitchenware', 'Meridian Heights', 34, '$50k to $200k', true],
  ['Fern & Fold Stationery', 'Gift shop', 'Downtown Loop', 31, '$10k to $50k', true],
  ['Pell Street Noodles', 'Restaurant', 'Riverside Row', 29, '$10k to $50k', false],
  ['Spinebound Books', 'Bookstore', 'Downtown Loop', 27, '$10k to $50k', true],
  ['Loom Bicycle Co.', 'Bike shop', 'Riverside Row', 24, '$10k to $50k', true],
  ['Verdant Grocer', 'Specialty grocer', 'Harbor District', 22, '$50k to $200k', false],
  ['Nettle & Bloom Florist', 'Florist', 'Downtown Loop', 19, 'Under $10k', true],
  ['Quill & Press', 'Print studio', 'Meridian Heights', 16, 'Under $10k', false],
  ['Anchor & Awl Tailor', 'Tailor', 'Riverside Row', 12, 'Under $10k', true],
]

export const GROWING_MERCHANTS: GrowingMerchant[] = RAW.map(
  ([name, category, cluster, growthPct, volumeBand, onAmex], i) => ({
    id: i + 1,
    name,
    category,
    cluster,
    growthPct,
    volumeBand,
    onAmex,
    series: series(100, growthPct, (i + 1) * 7919),
  }),
)

export const CLUSTERS = [
  'All regions',
  'Downtown Loop',
  'Riverside Row',
  'Harbor District',
  'Meridian Heights',
]
