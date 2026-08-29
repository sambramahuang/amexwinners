// -----------------------------------------------------------------------
// SYNTHETIC DEMO DATA, 50 US small and medium merchants.
//
// Business names are invented. The cities and neighbourhoods are real, which
// is what gives the demo its texture, but every growth figure, volume band and
// Amex relationship below is fabricated for illustration. Attaching invented
// financials to real, named companies would be making false claims about
// actual businesses, so no real company appears here.
// -----------------------------------------------------------------------

export interface UsMerchant {
  id: number
  name: string
  category: string
  neighbourhood: string
  city: string
  state: string
  /** 12-month growth in card volume, percent. */
  growthPct: number
  volumeBand: string
  onAmex: boolean
  series: number[]
}

const BANDS = ['Under $10k', '$10k to $50k', '$50k to $200k', '$200k+']

function series(growth: number, seed: number): number[] {
  const out: number[] = []
  let v = 100
  let s = seed
  for (let i = 0; i < 12; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const noise = (s / 0x7fffffff - 0.5) * 4.4
    v = v * (1 + growth / 100 / 12) + noise
    out.push(Math.round(v * 10) / 10)
  }
  return out
}

// name, category, neighbourhood, city, state, growth, band index, on Amex
const RAW: [string, string, string, string, string, number, number, boolean][] = [
  ['Cardinal & Rye', 'Bakery', 'Bushwick', 'Brooklyn', 'NY', 78, 1, false],
  ['Foldwell Paper Co.', 'Stationery', 'Hayes Valley', 'San Francisco', 'CA', 74, 1, false],
  ['Sixth & Sable', 'Restaurant', 'East Austin', 'Austin', 'TX', 71, 2, true],
  ['Marrow Butchery', 'Butcher', 'Ballard', 'Seattle', 'WA', 69, 1, true],
  ['Halcyon Sound', 'Record shop', 'Wicker Park', 'Chicago', 'IL', 66, 0, true],
  ['Verdigris Florals', 'Florist', 'Old Fourth Ward', 'Atlanta', 'GA', 64, 0, false],
  ['Pinebar Coffee', 'Café', 'Pearl District', 'Portland', 'OR', 62, 1, true],
  ['Ridgeline Climbing', 'Fitness studio', 'RiNo', 'Denver', 'CO', 61, 2, false],
  ['Ember & Oak', 'Home goods', 'Over-the-Rhine', 'Cincinnati', 'OH', 59, 1, true],
  ['Salt Harbor Oysters', 'Restaurant', 'Fort Point', 'Boston', 'MA', 57, 2, true],
  ['Thread & Thimble', 'Tailor', 'Fishtown', 'Philadelphia', 'PA', 55, 0, false],
  ['Bellwether Books', 'Bookstore', 'Cooper-Young', 'Memphis', 'TN', 54, 0, true],
  ['Copperline Brewing', 'Brewery', 'Deep Ellum', 'Dallas', 'TX', 52, 3, true],
  ['Juniper Row Gifts', 'Gift shop', 'Larimer Square', 'Denver', 'CO', 51, 1, false],
  ['Nine Mile Cyclery', 'Bike shop', 'Northeast', 'Minneapolis', 'MN', 49, 1, true],
  ['Aster & Vine', 'Wine bar', 'Silver Lake', 'Los Angeles', 'CA', 48, 2, true],
  ['Quarry Kitchenware', 'Kitchenware', 'Short North', 'Columbus', 'OH', 47, 1, false],
  ['Basin Coffee Roasters', 'Café', 'Downtown Loop', 'Chicago', 'IL', 46, 2, true],
  ['Windrow Cheese', 'Specialty grocer', 'Capitol Hill', 'Seattle', 'WA', 45, 1, true],
  ['Lantern Barbers', 'Barbershop', 'Highland Park', 'Los Angeles', 'CA', 44, 0, false],
  ['Trellis Plant Studio', 'Garden shop', 'Virginia-Highland', 'Atlanta', 'GA', 43, 0, true],
  ['Cobblestone Cobbler', 'Shoe repair', 'North End', 'Boston', 'MA', 42, 0, false],
  ['Fern & Fold', 'Gift shop', 'Andersonville', 'Chicago', 'IL', 41, 1, true],
  ['Blue Hour Ceramics', 'Pottery studio', 'Bywater', 'New Orleans', 'LA', 40, 0, false],
  ['Ironwood Furniture', 'Furniture', 'Design District', 'Miami', 'FL', 39, 3, true],
  ['Meridian Optics', 'Optician', 'Downtown', 'Nashville', 'TN', 38, 1, true],
  ['Saltwater Surf Co.', 'Sporting goods', 'Ocean Beach', 'San Diego', 'CA', 37, 1, false],
  ['Copperpot Deli', 'Deli', 'Tremont', 'Cleveland', 'OH', 36, 1, true],
  ['Willow & Wick', 'Home fragrance', 'The Heights', 'Houston', 'TX', 35, 0, false],
  ['Northgate Pilates', 'Fitness studio', 'Green Lake', 'Seattle', 'WA', 34, 1, true],
  ['Stonefruit Bakery', 'Bakery', 'Mission District', 'San Francisco', 'CA', 33, 1, true],
  ['Rivet Denim', 'Apparel', 'Alberta Arts', 'Portland', 'OR', 32, 1, false],
  ['Chapter House Coffee', 'Café', 'Ann Arbor', 'Ann Arbor', 'MI', 31, 0, true],
  ['Tidewater Provisions', 'Specialty grocer', 'Fells Point', 'Baltimore', 'MD', 30, 1, true],
  ['Lark & Larder', 'Restaurant', 'Germantown', 'Nashville', 'TN', 29, 2, true],
  ['Beacon Hill Framing', 'Framing', 'Beacon Hill', 'Boston', 'MA', 28, 0, false],
  ['Wren Skin Studio', 'Skin clinic', 'SoDoSoPa', 'Denver', 'CO', 27, 1, true],
  ['Hollow Creek Cider', 'Cidery', 'Hudson', 'Hudson', 'NY', 26, 1, false],
  ['Marigold Nails', 'Nail salon', 'Logan Square', 'Chicago', 'IL', 25, 0, true],
  ['Pier Six Seafood', 'Restaurant', 'Inner Harbor', 'Baltimore', 'MD', 24, 2, true],
  ['Anvil & Awl Leather', 'Leather goods', 'Uptown', 'Minneapolis', 'MN', 23, 0, false],
  ['Sunnyside Grocers', 'Specialty grocer', 'Sunnyside', 'Queens', 'NY', 22, 2, true],
  ['Foxglove Flowers', 'Florist', 'Georgetown', 'Washington', 'DC', 21, 0, true],
  ['Pressed & Bound', 'Print studio', 'Midtown', 'Kansas City', 'MO', 19, 0, false],
  ['Cedar Recovery', 'Wellness', 'South Congress', 'Austin', 'TX', 18, 1, false],
  ['Grainhouse Pizza', 'Restaurant', 'Little Italy', 'Cleveland', 'OH', 17, 1, true],
  ['Bramble Toy Shop', 'Toy shop', 'Larchmont', 'Los Angeles', 'CA', 15, 0, true],
  ['Harbor Lane Bikes', 'Bike shop', 'Point Loma', 'San Diego', 'CA', 13, 0, false],
  ['Violet & Vale Salon', 'Hair studio', 'Buckhead', 'Atlanta', 'GA', 11, 1, true],
  ['Old Post Tailoring', 'Tailor', 'Rittenhouse', 'Philadelphia', 'PA', 8, 0, true],
]

export const US_MERCHANTS: UsMerchant[] = RAW.map(
  ([name, category, neighbourhood, city, state, growthPct, band, onAmex], i) => ({
    id: i + 1,
    name,
    category,
    neighbourhood,
    city,
    state,
    growthPct,
    volumeBand: BANDS[band],
    onAmex,
    series: series(growthPct, (i + 1) * 7919),
  }),
)
