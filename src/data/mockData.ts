// -----------------------------------------------------------------------
// SYNTHETIC DEMO DATA
// All merchant names, transaction figures, and scores below are invented
// for demonstration purposes only. In production these would be derived
// from real anonymised, aggregated Amex closed-loop transaction data.
// -----------------------------------------------------------------------

export type ClusterId = 'everton' | 'duxton'

export interface Cluster {
  id: ClusterId
  label: string
  cx: number
  cy: number
}

export interface Merchant {
  id: string
  name: string
  category: string
  cluster: ClusterId
  x: number
  y: number
  sinceAmex: string
}

export interface Match {
  id: string
  a: string
  b: string
  overlapPct: number
  sequencePct: number
  symmetryScore: number
  explanation: string
  upliftA: string
  upliftB: string
}

export interface Gap {
  id: string
  cluster: ClusterId
  x: number
  y: number
  missingCategory: string
  evidence: string
  strength: string
  targetProfile: string
}

export interface ProspectProfile {
  id: string
  category: string
  linkedGap: string | null
  pitch: string
  upliftRange: string
}

// Two adjacent clusters (blocks) in a fictional Singapore district.
// Positions are hand-placed (percentages of the graph canvas) so the
// layout is stable and legible rather than physics-simulated.
export const CLUSTERS: Record<ClusterId, Cluster> = {
  everton: { id: 'everton', label: 'Everton Block', cx: 30, cy: 46 },
  duxton: { id: 'duxton', label: 'Duxton Row', cx: 74, cy: 50 },
}

// Prong 1 population: merchants already accepting Amex.
// symmetryScore: 0-100, how balanced the projected value is between the two
// sides of a match (this is the check designed to avoid a Plenti-style
// asymmetric-value failure).
export const MERCHANTS: Merchant[] = [
  { id: 'kopi-kin', name: 'Kopi & Kin', category: 'Café', cluster: 'everton', x: 20, y: 30, sinceAmex: '2023' },
  { id: 'petal-twine', name: 'Petal & Twine', category: 'Florist', cluster: 'everton', x: 38, y: 24, sinceAmex: '2022' },
  { id: 'marginalia', name: 'The Marginalia', category: 'Bookstore', cluster: 'everton', x: 16, y: 56, sinceAmex: '2024' },
  { id: 'sunday-loaf', name: 'Sunday Loaf', category: 'Bakery', cluster: 'everton', x: 40, y: 62, sinceAmex: '2021' },
  { id: 'nook', name: 'Nook Homeware', category: 'Gift & Home', cluster: 'everton', x: 28, y: 72, sinceAmex: '2023' },

  { id: 'woodgrain', name: 'Woodgrain Barber Co.', category: 'Barber', cluster: 'duxton', x: 66, y: 30, sinceAmex: '2022' },
  { id: 'selvedge', name: 'Selvedge & Sons', category: 'Tailor', cluster: 'duxton', x: 84, y: 26, sinceAmex: '2024' },
  { id: 'vine-rind', name: 'Vine & Rind', category: 'Wine & Cheese Bar', cluster: 'duxton', x: 88, y: 58, sinceAmex: '2023' },
  { id: 'ficus-fern', name: 'Ficus & Fern', category: 'Plant Shop', cluster: 'duxton', x: 68, y: 68, sinceAmex: '2022' },
  { id: 'still-point', name: 'Still Point Yoga', category: 'Yoga Studio', cluster: 'duxton', x: 78, y: 42, sinceAmex: '2024' },
]

// Prong 1: inferred complementary relationships between existing merchants.
// overlapPct: % of shared customer base (collaborative signal)
// sequencePct: % of shared customers who visit the second merchant within
//              14 days of the first (the stronger, sequence-based signal)
export const MATCHES: Match[] = [
  {
    id: 'kopi-marginalia',
    a: 'kopi-kin', b: 'marginalia',
    overlapPct: 41, sequencePct: 27, symmetryScore: 88,
    explanation: "27% of Kopi & Kin's customers visit The Marginalia within 14 days, and the reverse holds almost as strongly (24%). Neither side is subsidising the other.",
    upliftA: '9–13%', upliftB: '8–12%',
  },
  {
    id: 'kopi-petal',
    a: 'kopi-kin', b: 'petal-twine',
    overlapPct: 33, sequencePct: 19, symmetryScore: 74,
    explanation: 'Weekend-brunch customers at Kopi & Kin show a 19% follow-through to Petal & Twine same-day, concentrated on Saturdays.',
    upliftA: '6–9%', upliftB: '10–14%',
  },
  {
    id: 'sunday-nook',
    a: 'sunday-loaf', b: 'nook',
    overlapPct: 46, sequencePct: 31, symmetryScore: 91,
    explanation: 'Celebration-occasion spend (birthdays, housewarmings) links these two almost symmetrically — customers buying cake also buy a gift, in either order.',
    upliftA: '11–15%', upliftB: '11–16%',
  },
  {
    id: 'petal-nook',
    a: 'petal-twine', b: 'nook',
    overlapPct: 22, sequencePct: 12, symmetryScore: 52,
    explanation: 'Overlap exists but is one-directional: Nook customers visit Petal & Twine far more than the reverse. Flagged as a lower-symmetry candidate.',
    upliftA: '3–5%', upliftB: '7–10%',
  },
  {
    id: 'woodgrain-selvedge',
    a: 'woodgrain', b: 'selvedge',
    overlapPct: 52, sequencePct: 38, symmetryScore: 93,
    explanation: 'The strongest pair in the district: 38% of Woodgrain customers book Selvedge & Sons within two weeks, and Selvedge customers return the pattern almost exactly.',
    upliftA: '14–19%', upliftB: '13–18%',
  },
  {
    id: 'vine-ficus',
    a: 'vine-rind', b: 'ficus-fern',
    overlapPct: 29, sequencePct: 16, symmetryScore: 79,
    explanation: 'A quieter but balanced pairing — dinner-party shoppers at Vine & Rind pick up plants at Ficus & Fern in the same visit window, and vice versa.',
    upliftA: '7–10%', upliftB: '8–11%',
  },
  {
    id: 'still-woodgrain',
    a: 'still-point', b: 'woodgrain',
    overlapPct: 24, sequencePct: 14, symmetryScore: 68,
    explanation: 'Modest but genuine overlap between yoga-studio and barbershop customers, concentrated on weekday evenings.',
    upliftA: '5–7%', upliftB: '4–6%',
  },
]

// Prong 3: gaps detected in the graph — a category that is well-supported
// by cross-cluster demand evidence but has no merchant filling it locally.
export const GAPS: Gap[] = [
  {
    id: 'gap-duxton-cafe',
    cluster: 'duxton',
    x: 78, y: 24,
    missingCategory: 'Café',
    evidence:
      "Amex cardholders who shop at Woodgrain, Selvedge & Sons, and Still Point Yoga spend at cafés 3.1x more than the network average — but no café merchant exists in Duxton Row. In Everton Block, Kopi & Kin's presence lifts adjacent-merchant spend by double digits (see Prong 1); Duxton Row's cluster shows the same latent demand with nowhere for it to land.",
    strength: 'High confidence',
    targetProfile: 'Independent café or specialty coffee bar, 400–800 sq ft, weekday-evening + weekend capacity',
  },
  {
    id: 'gap-everton-wellness',
    cluster: 'everton',
    x: 14, y: 40,
    missingCategory: 'Wellness / Studio',
    evidence:
      "Everton Block's customer base indexes 1.8x above network average for wellness-category spend elsewhere in the city, but the block has no wellness or fitness merchant of its own — a smaller, secondary signal than the Duxton café gap.",
    strength: 'Moderate confidence',
    targetProfile: 'Boutique fitness studio, pilates/yoga, or wellness spa',
  },
]

// Prong 2: category-level projected preview shown to prospects who are not
// yet Amex merchants (no live transaction data exists for them yet, so this
// is content-based — derived from patterns across the existing graph, not
// a computed match).
export const PROSPECT_PROFILES: ProspectProfile[] = [
  {
    id: 'prospect-cafe',
    category: 'Café',
    linkedGap: 'gap-duxton-cafe',
    pitch:
      "Café-type merchants placed alongside barber, tailor, and studio businesses in comparable clusters have seen 9–19% uplift in cross-visit spend within 90 days of joining. Duxton Row is showing unusually strong latent demand for exactly this category.",
    upliftRange: '9–19%',
  },
  {
    id: 'prospect-wellness',
    category: 'Wellness / Studio',
    linkedGap: 'gap-everton-wellness',
    pitch:
      'Wellness studios entering districts with strong florist, bookstore, and café adjacency typically see 5–11% uplift, with the strongest effect in the first two quarters.',
    upliftRange: '5–11%',
  },
  {
    id: 'prospect-grocer',
    category: 'Specialty Grocer',
    linkedGap: null,
    pitch:
      'No specific district gap detected yet for this category, but specialty grocers in similar mixed-retail clusters average 6–10% uplift from complementary bakery and wine-bar pairings.',
    upliftRange: '6–10%',
  },
]

export function getMerchant(id: string): Merchant | undefined {
  return MERCHANTS.find((m) => m.id === id)
}

export function matchesForMerchant(id: string): Match[] {
  return MATCHES.filter((m) => m.a === id || m.b === id).sort(
    (x, y) => y.symmetryScore - x.symmetryScore
  )
}

export function otherSide(match: Match, id: string): string {
  return match.a === id ? match.b : match.a
}
