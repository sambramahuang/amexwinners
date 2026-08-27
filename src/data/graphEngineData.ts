// -----------------------------------------------------------------------
// SYNTHETIC DEMO DATA
// All merchant names, transaction figures, and scores below are invented
// for demonstration purposes only. In production these would be derived
// from real anonymised, aggregated Amex closed-loop transaction data.
// -----------------------------------------------------------------------

/**
 * Relationship tier — Circuit's own suggested framing for a match, not
 * something merchants configure. Tier 1 is every match's starting point;
 * Tier 2/3 are suggested once performance and symmetry hold up over time.
 */
export type RelationshipTier = 1 | 2 | 3

export interface MerchantContact {
  name: string
  role: string
  /** Reserved .example domain, so no illustrative address can reach a real inbox. */
  email: string
}

/** The relationship manager outreach is sent as. */
export const AMEX_REP = {
  name: 'Dana Whitfield',
  role: 'Merchant Partnerships, American Express',
  email: 'dana.whitfield@amex.example',
  phone: '+1 212 555 0148',
}

/** Prong 1: a merchant already accepting Amex, queued for matching against Basin Coffee Roasters. */
export interface MatchCandidate {
  id: number
  name: string
  shortName: string
  category: string
  /** % of shared customer base (collaborative signal) */
  overlapPct: number
  /** Sequential-visit explanation (the stronger, sequence-based signal) */
  sequential: string
  /** Projected uplift for Basin, in percentage points */
  upliftYou: number
  /** Projected uplift for the candidate, in percentage points */
  upliftThem: number
  balanceColor: string
  balanceNote: string
  terms: string
  /** Synthetic brand-vibe tags used only for the optional personality-fit nudge. */
  personalityTags: string[]
  /** Circuit's suggested relationship tier for this match. */
  tier: RelationshipTier
  /** Simulated — how long this match has been live, in months. */
  monthsActive: number
  /** Why this match sits at its current tier. */
  tierRationale: string
  /** Tier-3 only: a non-binding starter benchmark for a structural relationship. */
  tier3Suggestion?: string
  /** Released to the other side only once both merchants match. */
  contact: MerchantContact
}

export const MATCH_CANDIDATES: MatchCandidate[] = [
  {
    id: 1,
    name: 'Spinebound Books',
    shortName: 'Spinebound',
    category: 'Bookstore',
    overlapPct: 44,
    sequential: 'Customers who buy from Spinebound return to Basin for coffee the same day 44% of the time.',
    upliftYou: 21,
    upliftThem: 24,
    balanceColor: '#2bb8a3',
    balanceNote: 'Balanced · Δ3pts — value flows both ways.',
    terms: 'In-store QR at Spinebound: book club members get their first coffee free at Basin.',
    personalityTags: ['slow-browse', 'community', 'ritual'],
    contact: { name: 'Maya Rehn', role: 'Owner', email: 'maya@spineboundbooks.example' },
    tier: 3,
    monthsActive: 8,
    tierRationale:
      '8 months of consistent redemption and the tightest value symmetry in the cluster (Δ3pts) make this a candidate for a standing relationship, not just a recurring offer.',
    tier3Suggestion:
      'Peer café–bookstore pairs of this size typically settle into a shared weekly event slot (one in-store reading or tasting per week) rather than a one-off offer.',
  },
  {
    id: 2,
    name: 'Fern & Fold Stationery',
    shortName: 'Fern & Fold',
    category: 'Gift shop',
    overlapPct: 38,
    sequential: "38% of Basin's customers visit Fern & Fold within two weeks of their coffee run.",
    upliftYou: 16,
    upliftThem: 19,
    balanceColor: '#2bb8a3',
    balanceNote: 'Balanced · Δ3pts — value flows both ways.',
    terms: 'Joint loyalty stamp: every 5th coffee unlocks 10% off any stationery item.',
    personalityTags: ['occasion', 'brand-aesthetic', 'shared-regulars'],
    contact: { name: 'Owen Marsh', role: 'Founder', email: 'owen@fernfoldstationery.example' },
    tier: 2,
    monthsActive: 5,
    tierRationale: '5 months and 3 offer cycles of steady redemption support repeating this on an ongoing cadence instead of renegotiating each time.',
  },
  {
    id: 3,
    name: 'Nettle & Bloom Florist',
    shortName: 'Nettle & Bloom',
    category: 'Florist',
    overlapPct: 29,
    sequential: '29% of florist customers stop at Basin within the same week.',
    upliftYou: 13,
    upliftThem: 15,
    balanceColor: '#2bb8a3',
    balanceNote: 'Balanced · Δ2pts — value flows both ways.',
    terms: 'Shared window display plus cross-tagged social posts each Friday.',
    personalityTags: ['occasion', 'brand-aesthetic', 'shared-events'],
    contact: { name: 'Priya Raman', role: 'Owner', email: 'priya@nettlebloomflorist.example' },
    tier: 2,
    monthsActive: 4,
    tierRationale: '4 months and 2 offer cycles of consistent redemption support repeating this on an ongoing cadence instead of renegotiating each time.',
  },
  {
    id: 4,
    name: 'Loom Bicycle Co.',
    shortName: 'Loom Bicycle',
    category: 'Bike shop',
    overlapPct: 21,
    sequential: '21% overlap; sequencing signal is still forming — fewer than 90 days of data.',
    upliftYou: 9,
    upliftThem: 27,
    balanceColor: '#e8b54d',
    balanceNote: 'Auto-rebalanced: added a Basin gift-card bonus for Loom Bicycle referrals to close an 18pt gap.',
    terms: 'Referral card: bike tune-up customers get a free drip coffee at Basin.',
    personalityTags: ['fast-paced', 'convenience', 'shared-regulars'],
    contact: { name: 'Theo Vance', role: 'Managing Director', email: 'theo@loombicycleco.example' },
    tier: 1,
    monthsActive: 1,
    tierRationale: 'A new, single-offer proposal — sequencing signal is still forming, so it starts here rather than at a recurring cadence.',
  },
  {
    id: 5,
    name: 'Ridgeline Yoga Studio',
    shortName: 'Ridgeline',
    category: 'Fitness studio',
    overlapPct: 18,
    sequential: 'Early signal — 18% overlap, sequencing still sparse.',
    upliftYou: 8,
    upliftThem: 20,
    balanceColor: '#e8b54d',
    balanceNote: 'Auto-rebalanced: added a post-class coffee voucher to close a 12pt gap.',
    terms: 'Post-class voucher: first coffee free after any studio class.',
    personalityTags: ['ritual', 'community', 'shared-events'],
    contact: { name: 'Dana Okafor', role: 'Founder', email: 'dana@ridgelineyogastudio.example' },
    tier: 1,
    monthsActive: 2,
    tierRationale: 'A new, single-offer proposal — sequencing signal is still sparse, so it starts here rather than at a recurring cadence.',
  },
  {
    id: 6,
    name: 'Anchor & Awl Tailor',
    shortName: 'Anchor & Awl',
    category: 'Tailor',
    overlapPct: 12,
    sequential: "Low overlap — customers don't yet cross-shop between these two.",
    upliftYou: 4,
    upliftThem: 6,
    balanceColor: '#96a3c0',
    balanceNote: 'Low confidence · thin signal — hold until more data accrues.',
    terms: 'No proposal yet — insufficient signal to suggest terms.',
    personalityTags: ['low-maintenance', 'occasion'],
    contact: { name: 'Sam Idris', role: 'Owner', email: 'sam@anchorawltailor.example' },
    tier: 1,
    monthsActive: 1,
    tierRationale: 'Signal is too thin to propose anything beyond a single trial offer yet.',
  },
]

export const TIER_LABELS: Record<RelationshipTier, string> = {
  1: 'Tier 1 · Linked Offer',
  2: 'Tier 2 · Recurring',
  3: 'Tier 3 · Structural',
}

/** Prong 2: a prospect with no Amex transaction history, linked to a Prong-3 gap. */
export interface WaitingMerchant {
  name: string
  why: string
}

export interface ProspectTarget {
  id: number
  name: string
  category: string
  cluster: string
  reasoning: string
  upliftRange: string
  pitchCopy: string
  waiting: WaitingMerchant[]
  contact: MerchantContact
}

export const PROSPECT_TARGETS: ProspectTarget[] = [
  {
    id: 1,
    name: 'Juniper & Fern Gift Co.',
    category: 'Gift shop',
    cluster: 'Downtown Loop',
    reasoning:
      'Three merchants in Downtown Loop show 30–44% mutual overlap, but none carries a gift line.',
    upliftRange: '+15–24%',
    pitchCopy:
      'Gift shops paired with café-and-books clusters like Downtown Loop typically see a lift in repeat visits within the first two quarters, driven by customers who already cross-shop nearby.',
    contact: { name: 'Elena Moss', role: 'Owner', email: 'elena@juniperferngiftco.example' },
    waiting: [
      { name: 'Basin Coffee Roasters', why: '38% of its customers already cross-shop gift and stationery nearby.' },
      { name: 'Spinebound Books', why: 'Book buyers over-index on gift purchases the same week.' },
      { name: 'Nettle & Bloom Florist', why: 'Florist customers frequently add a gift item to their visit.' },
    ],
  },
  {
    id: 2,
    name: 'Marlowe Paper Goods',
    category: 'Stationery',
    cluster: 'Downtown Loop',
    reasoning:
      'Same structural hole as Juniper & Fern — a stationery line is missing from this tight cluster.',
    upliftRange: '+12–20%',
    pitchCopy:
      'Stationery merchants near café-and-books clusters see steady cross-visit lift, especially from bookstore customers already primed for paper goods.',
    contact: { name: 'Ruth Calder', role: 'Founder', email: 'ruth@marlowepapergoods.example' },
    waiting: [
      { name: 'Basin Coffee Roasters', why: '38% of its customers already cross-shop gift and stationery nearby.' },
      { name: 'Spinebound Books', why: 'Book buyers over-index on stationery purchases the same week.' },
      { name: 'Nettle & Bloom Florist', why: 'Florist customers frequently add a card or paper good to their visit.' },
    ],
  },
  {
    id: 3,
    name: 'Sable & Stone Gifts',
    category: 'Home & gift',
    cluster: 'Downtown Loop',
    reasoning:
      'Third candidate for the same gap — home-and-gift assortment fits the missing category best.',
    upliftRange: '+14–23%',
    pitchCopy:
      'Home-and-gift merchants entering clusters like Downtown Loop typically capture spend that’s currently leaking to shops outside the cluster.',
    contact: { name: 'Noor Haddad', role: 'Owner', email: 'noor@sablestonegifts.example' },
    waiting: [
      { name: 'Basin Coffee Roasters', why: '38% of its customers already cross-shop gift and stationery nearby.' },
      { name: 'Spinebound Books', why: 'Book buyers over-index on gift purchases the same week.' },
      { name: 'Nettle & Bloom Florist', why: 'Florist customers frequently add a gift item to their visit.' },
    ],
  },
  {
    id: 4,
    name: 'Cedar Recovery Co.',
    category: 'Wellness / recovery',
    cluster: 'Riverside Row',
    reasoning:
      'Yoga, cycling and tailoring customers in Riverside Row cross-visit heavily, but no recovery merchant exists.',
    upliftRange: '+18–27%',
    pitchCopy:
      'Recovery and wellness merchants placed near active-lifestyle clusters like Riverside Row typically see fast adoption from customers already moving through the cluster.',
    contact: { name: 'Felix Arden', role: 'Managing Director', email: 'felix@cedarrecoveryco.example' },
    waiting: [
      { name: 'Ridgeline Yoga Studio', why: 'Early cross-visit signal with active-recovery seekers.' },
      { name: 'Loom Bicycle Co.', why: 'Cyclists show strong intent for post-ride recovery services.' },
      { name: 'Anchor & Awl Tailor', why: 'Shared foot traffic in the same three blocks.' },
    ],
  },
]
