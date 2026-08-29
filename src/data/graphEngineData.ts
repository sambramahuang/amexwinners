// -----------------------------------------------------------------------
// SYNTHETIC DEMO DATA
// All merchant names, transaction figures, and scores below are invented
// for demonstration purposes only. In production these would be derived
// from real anonymised, aggregated Amex closed-loop transaction data.
// -----------------------------------------------------------------------

/**
 * Relationship tier. Connexion's own suggested framing for a match, not
 * something merchants configure. Tier 1 is every match's starting point;
 * Tier 2/3 are suggested once performance and symmetry hold up over time.
 */
export type RelationshipTier = 1 | 2 | 3

/**
 * What a merchant says they are looking for. Self reported, and used to
 * reorder the queue rather than to score: the transaction data decides how
 * good a match is, this decides which good matches to show first.
 */
export type PartnershipGoal =
  | 'cross-industry'
  | 'long-term'
  | 'new-demographic'
  | 'same-industry'

export const GOAL_LABELS: Record<PartnershipGoal, string> = {
  'cross-industry': 'Cross industry collaboration',
  'long-term': 'Long term partnership',
  'new-demographic': 'Exposure to a new demographic',
  'same-industry': 'Collaboration in my own industry',
}

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
  terms: string
  /** Connexion's suggested relationship tier for this match. */
  tier: RelationshipTier
  /** Simulated. How long this match has been live, in months. */
  monthsActive: number
  /** Why this match sits at its current tier. */
  tierRationale: string
  /** Tier-3 only: a non-binding starter benchmark for a structural relationship. */
  tier3Suggestion?: string
  /** Released to the other side only once both merchants match. */
  contact: MerchantContact
  /**
   * Whether this merchant has already liked Basin. A like only becomes a match
   * when it runs both ways, so this decides which of the two the queue produces.
   * Fixed in data rather than rolled at runtime, so a demo repeats exactly.
   */
  likedYouBack: boolean
  /** Days since this merchant last opened Connexion. Feeds openness to collaborate. */
  lastActiveDays: number
  /** Share of partnership approaches this merchant has replied to, percent. */
  responseRate: number
  /** Two-letter monogram and brand colour for the card mark. */
  mark: { initials: string; color: string }
  /** What a partnership with this merchant would offer. */
  goals: PartnershipGoal[]
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
    terms: 'In-store QR at Spinebound: book club members get their first coffee free at Basin.',
    contact: { name: 'Maya Rehn', role: 'Owner', email: 'maya@spineboundbooks.example' },
    likedYouBack: true,
    lastActiveDays: 2,
    responseRate: 86,
    mark: { initials: 'SB', color: '#7d5a3c' },
    goals: ['cross-industry', 'long-term'],
    tier: 3,
    monthsActive: 8,
    tierRationale:
      '8 months of consistent redemption and the closest value symmetry in the cluster make this a candidate for a standing relationship, not just a recurring offer.',
    tier3Suggestion:
      'Peer cafe and bookstore pairs of this size typically settle into a shared weekly event slot (one in-store reading or tasting per week) rather than a one-off offer.',
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
    terms: 'Joint loyalty stamp: every 5th coffee unlocks 10% off any stationery item.',
    contact: { name: 'Owen Marsh', role: 'Founder', email: 'owen@fernfoldstationery.example' },
    likedYouBack: false,
    lastActiveDays: 9,
    responseRate: 61,
    mark: { initials: 'FF', color: '#4f7f6a' },
    goals: ['cross-industry', 'new-demographic'],
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
    terms: 'Shared window display plus cross-tagged social posts each Friday.',
    contact: { name: 'Priya Raman', role: 'Owner', email: 'priya@nettlebloomflorist.example' },
    likedYouBack: true,
    lastActiveDays: 4,
    responseRate: 74,
    mark: { initials: 'NB', color: '#a35a86' },
    goals: ['cross-industry', 'new-demographic'],
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
    sequential: '21% overlap, and the sequencing signal is still forming on fewer than 90 days of data.',
    upliftYou: 9,
    upliftThem: 27,
    terms: 'Referral card: bike tune-up customers get a free drip coffee at Basin.',
    contact: { name: 'Theo Vance', role: 'Managing Director', email: 'theo@loombicycleco.example' },
    likedYouBack: false,
    lastActiveDays: 21,
    responseRate: 38,
    mark: { initials: 'LB', color: '#c2683f' },
    goals: ['cross-industry', 'new-demographic'],
    tier: 1,
    monthsActive: 1,
    tierRationale: 'A new, single-offer proposal. The sequencing signal is still forming, so it starts here rather than at a recurring cadence.',
  },
  {
    id: 5,
    name: 'Ridgeline Yoga Studio',
    shortName: 'Ridgeline',
    category: 'Fitness studio',
    overlapPct: 18,
    sequential: 'Early signal. 18% overlap, and sequencing is still sparse.',
    upliftYou: 8,
    upliftThem: 20,
    terms: 'Post-class voucher: first coffee free after any studio class.',
    contact: { name: 'Dana Okafor', role: 'Founder', email: 'dana@ridgelineyogastudio.example' },
    likedYouBack: true,
    lastActiveDays: 6,
    responseRate: 69,
    mark: { initials: 'RY', color: '#5b7fa6' },
    goals: ['cross-industry', 'new-demographic', 'long-term'],
    tier: 1,
    monthsActive: 2,
    tierRationale: 'A new, single-offer proposal. The sequencing signal is still sparse, so it starts here rather than at a recurring cadence.',
  },
  {
    id: 6,
    name: 'Anchor & Awl Tailor',
    shortName: 'Anchor & Awl',
    category: 'Tailor',
    overlapPct: 12,
    sequential: "Low overlap. Customers do not yet cross-shop between these two.",
    upliftYou: 4,
    upliftThem: 6,
    terms: 'No proposal yet. Not enough signal to suggest terms.',
    contact: { name: 'Sam Idris', role: 'Owner', email: 'sam@anchorawltailor.example' },
    likedYouBack: false,
    lastActiveDays: 34,
    responseRate: 24,
    mark: { initials: 'AA', color: '#7a6a53' },
    goals: ['cross-industry'],
    tier: 1,
    monthsActive: 1,
    tierRationale: 'Signal is too thin to propose anything beyond a single trial offer yet.',
  },
  {
    id: 7,
    name: 'Marrow & Bloom Deli',
    shortName: 'Marrow & Bloom',
    category: 'Deli',
    overlapPct: 41,
    sequential: "41% of Basin's morning customers pick up lunch at Marrow & Bloom the same day.",
    upliftYou: 19,
    upliftThem: 22,
    terms: "Lunch bundle: any Basin coffee before 11am takes 15% off a Marrow & Bloom sandwich.",
    tier: 2,
    monthsActive: 5,
    tierRationale:
      "Five months of steady redemption on a recurring lunch offer, with the volume holding through the summer dip.",
    contact: { name: 'Iris Delgado', role: 'Owner', email: 'iris@marrowbloomdeli.example' },
    likedYouBack: true,
    lastActiveDays: 3,
    responseRate: 81,
    mark: { initials: 'MB', color: '#8a5a3b' },
    goals: ['cross-industry', 'long-term'],
  },
  {
    id: 8,
    name: 'Northlight Photography',
    shortName: 'Northlight',
    category: 'Photography studio',
    overlapPct: 36,
    sequential: "Northlight clients book a Basin table for their pre-shoot meeting 36% of the time.",
    upliftYou: 17,
    upliftThem: 15,
    terms: "Shoot-day catering: Basin supplies the studio, Northlight lists Basin as its recommended stop.",
    tier: 1,
    monthsActive: 2,
    tierRationale:
      "A new proposal. The sequence is clear but the volume is still small, so it starts as a single linked offer.",
    contact: { name: 'Bo Ferreira', role: 'Founder', email: 'bo@northlightphotography.example' },
    likedYouBack: false,
    lastActiveDays: 11,
    responseRate: 54,
    mark: { initials: 'NP', color: '#4f6f8f' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 9,
    name: 'Kettle & Kin Bakery',
    shortName: 'Kettle & Kin',
    category: 'Bakery',
    overlapPct: 34,
    sequential: "34% of Kettle & Kin customers stop at Basin within the hour, mostly before 10am.",
    upliftYou: 14,
    upliftThem: 26,
    terms: "Morning pairing: a Kettle & Kin pastry and a Basin filter for a set price.",
    tier: 1,
    monthsActive: 1,
    tierRationale:
      "A new proposal, and the uplift runs strongly one way, so it starts small while the balance is watched.",
    contact: { name: 'Wren Tobias', role: 'Owner', email: 'wren@kettlekinbakery.example' },
    likedYouBack: true,
    lastActiveDays: 1,
    responseRate: 92,
    mark: { initials: 'KK', color: '#b1743f' },
    goals: ['same-industry', 'long-term'],
  },
  {
    id: 10,
    name: 'Foxglove Flowers',
    shortName: 'Foxglove',
    category: 'Florist',
    overlapPct: 31,
    sequential: "31% of Foxglove customers visit Basin the same afternoon, peaking on Fridays.",
    upliftYou: 16,
    upliftThem: 18,
    terms: "Friday bundle: a stem with any Basin pastry, cross-tagged on both social accounts.",
    tier: 2,
    monthsActive: 7,
    tierRationale:
      "Seven months of Friday volume that holds through the quiet weeks, which is why it moved past a single offer.",
    contact: { name: 'Anouk Reyes', role: 'Owner', email: 'anouk@foxgloveflowers.example' },
    likedYouBack: false,
    lastActiveDays: 6,
    responseRate: 63,
    mark: { initials: 'FG', color: '#a35a86' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 11,
    name: 'Grainline Cycles',
    shortName: 'Grainline',
    category: 'Bike shop',
    overlapPct: 28,
    sequential: "28% of Grainline service customers wait out the repair at Basin.",
    upliftYou: 13,
    upliftThem: 20,
    terms: "Service-wait voucher: a free filter coffee while a repair is in progress.",
    tier: 1,
    monthsActive: 3,
    tierRationale:
      "A new proposal built on a clear waiting-time pattern, though the total volume is modest.",
    contact: { name: 'Casey Mbeki', role: 'Managing Director', email: 'casey@grainlinecycles.example' },
    likedYouBack: true,
    lastActiveDays: 4,
    responseRate: 77,
    mark: { initials: 'GC', color: '#c2683f' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 12,
    name: 'Ash & Ember Ceramics',
    shortName: 'Ash & Ember',
    category: 'Pottery studio',
    overlapPct: 26,
    sequential: "26% of Ash & Ember class attendees order at Basin before their session.",
    upliftYou: 12,
    upliftThem: 14,
    terms: "Class-day offer: studio bookings include a Basin drink token.",
    tier: 1,
    monthsActive: 2,
    tierRationale:
      "A new proposal. Class schedules make the pattern predictable, but the base is small.",
    contact: { name: 'Junia Park', role: 'Founder', email: 'junia@ashemberceramics.example' },
    likedYouBack: false,
    lastActiveDays: 19,
    responseRate: 41,
    mark: { initials: 'AE', color: '#7b6a94' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 13,
    name: 'Salt Path Provisions',
    shortName: 'Salt Path',
    category: 'Specialty grocer',
    overlapPct: 24,
    sequential: "24% of Salt Path shoppers cross to Basin on the same trip, mostly at weekends.",
    upliftYou: 15,
    upliftThem: 13,
    terms: "Weekend pairing: Basin beans stocked at Salt Path, Salt Path granola served at Basin.",
    tier: 2,
    monthsActive: 6,
    tierRationale:
      "Six months of two-way stock sharing that both sides have kept up without prompting.",
    contact: { name: 'Halden Ruiz', role: 'Owner', email: 'halden@saltpathprovisions.example' },
    likedYouBack: true,
    lastActiveDays: 8,
    responseRate: 58,
    mark: { initials: 'SP', color: '#5f7f5a' },
    goals: ['cross-industry', 'long-term'],
  },
  {
    id: 14,
    name: 'Verso Print Studio',
    shortName: 'Verso',
    category: 'Print studio',
    overlapPct: 21,
    sequential: "21% of Verso clients meet at Basin before collecting a job.",
    upliftYou: 10,
    upliftThem: 12,
    terms: "Meeting stop: Verso lists Basin as its client meeting point, Basin displays Verso work.",
    tier: 1,
    monthsActive: 4,
    tierRationale:
      "A new proposal. The overlap is real but thin, so it starts as a single linked offer.",
    contact: { name: 'Milo Ashford', role: 'Owner', email: 'milo@versoprintstudio.example' },
    likedYouBack: false,
    lastActiveDays: 27,
    responseRate: 33,
    mark: { initials: 'VP', color: '#6f8fa8' },
    goals: ['cross-industry'],
  },
  {
    id: 15,
    name: 'Halcyon Records',
    shortName: 'Halcyon',
    category: 'Record shop',
    overlapPct: 18,
    sequential: "18% of Halcyon customers stop at Basin the same afternoon, with a clear weekend skew.",
    upliftYou: 9,
    upliftThem: 11,
    terms: "Listening hours: Basin plays a Halcyon selection, Halcyon customers get a weekend discount.",
    tier: 1,
    monthsActive: 2,
    tierRationale:
      "A new proposal on a weekend-only pattern, which is too narrow to build on yet.",
    contact: { name: 'Odile Nkemi', role: 'Founder', email: 'odile@halcyonrecords.example' },
    likedYouBack: true,
    lastActiveDays: 7,
    responseRate: 66,
    mark: { initials: 'HR', color: '#b06bc9' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 16,
    name: 'Quarry Kitchenware',
    shortName: 'Quarry',
    category: 'Kitchenware',
    overlapPct: 15,
    sequential: "15% overlap, concentrated in customers buying coffee equipment.",
    upliftYou: 7,
    upliftThem: 9,
    terms: "Brew-kit pairing: Basin beans bundled with any Quarry coffee equipment sale.",
    tier: 1,
    monthsActive: 1,
    tierRationale:
      "A new proposal on a narrow but well-defined slice of both customer bases.",
    contact: { name: 'Teodor Vance', role: 'Owner', email: 'teodor@quarrykitchenware.example' },
    likedYouBack: false,
    lastActiveDays: 41,
    responseRate: 19,
    mark: { initials: 'QK', color: '#7a6a53' },
    goals: ['cross-industry'],
  },
  {
    id: 17,
    name: 'Vellum & Vine Bookbindery',
    shortName: 'Vellum & Vine',
    category: 'Bookbinder',
    overlapPct: 33,
    sequential: "33% of Vellum & Vine's workshop attendees order at Basin before their class.",
    upliftYou: 13,
    upliftThem: 16,
    terms: "Workshop pairing: class bookings include a Basin drink, Basin displays bound work.",
    tier: 1,
    monthsActive: 3,
    tierRationale:
      "A new proposal on a small but reliable class-day pattern.",
    contact: { name: 'Ines Cardoso', role: 'Owner', email: 'ines@vellumvinebookbindery.example' },
    likedYouBack: true,
    lastActiveDays: 5,
    responseRate: 72,
    mark: { initials: 'VV', color: '#6b5b8a' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 18,
    name: 'Copperleaf Tea Room',
    shortName: 'Copperleaf',
    category: 'Tea room',
    overlapPct: 29,
    sequential: "29% of Copperleaf's afternoon customers were at Basin that morning.",
    upliftYou: 11,
    upliftThem: 9,
    terms: "Split the day: Basin takes mornings, Copperleaf takes afternoons, each refers the other.",
    tier: 2,
    monthsActive: 6,
    tierRationale:
      "Six months of a clean morning and afternoon split that neither side has had to police.",
    contact: { name: 'Marta Lindqvist', role: 'Owner', email: 'marta@copperleaftearoom.example' },
    likedYouBack: false,
    lastActiveDays: 9,
    responseRate: 64,
    mark: { initials: 'CT', color: '#8a6f4f' },
    goals: ['same-industry', 'long-term'],
  },
  {
    id: 19,
    name: 'Foundry Coworking',
    shortName: 'Foundry',
    category: 'Coworking',
    overlapPct: 47,
    sequential: "47% of Foundry members buy from Basin at least twice a week.",
    upliftYou: 24,
    upliftThem: 18,
    terms: "Member rate: Foundry members get a standing discount, Basin becomes the house cafe.",
    tier: 3,
    monthsActive: 11,
    tierRationale:
      "Eleven months of daily volume from a fixed member base, the steadiest relationship in the cluster.",
    contact: { name: 'Dario Bennett', role: 'Managing Director', email: 'dario@foundrycoworking.example' },
    likedYouBack: true,
    lastActiveDays: 1,
    responseRate: 89,
    mark: { initials: 'FC', color: '#3f6f8f' },
    goals: ['cross-industry', 'long-term', 'new-demographic'],
  },
  {
    id: 20,
    name: 'Ashgrove Montessori',
    shortName: 'Ashgrove',
    category: 'Nursery',
    overlapPct: 26,
    sequential: "26% of Ashgrove parents stop at Basin on the school run.",
    upliftYou: 12,
    upliftThem: 7,
    terms: "Parent hour: a discount between drop-off and ten, when Basin is quiet.",
    tier: 1,
    monthsActive: 2,
    tierRationale:
      "A new proposal aimed squarely at Basin's quietest hour.",
    contact: { name: 'Grace Okonjo', role: 'Founder', email: 'grace@ashgrovemontessori.example' },
    likedYouBack: true,
    lastActiveDays: 6,
    responseRate: 68,
    mark: { initials: 'AM', color: '#5f8a6a' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 21,
    name: 'Pallet & Pour Wine Bar',
    shortName: 'Pallet & Pour',
    category: 'Wine bar',
    overlapPct: 22,
    sequential: "22% of Pallet & Pour's early customers came from Basin earlier the same day.",
    upliftYou: 10,
    upliftThem: 13,
    terms: "Day into night: Basin closes at five, Pallet & Pour opens at four, one shared loyalty card.",
    tier: 2,
    monthsActive: 5,
    tierRationale:
      "Five months of a handover that works because the trading hours barely overlap.",
    contact: { name: 'Luca Moretti', role: 'Owner', email: 'luca@palletpourwinebar.example' },
    likedYouBack: false,
    lastActiveDays: 14,
    responseRate: 49,
    mark: { initials: 'PP', color: '#7a3f52' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 22,
    name: 'Rill & Row Bakehouse',
    shortName: 'Rill & Row',
    category: 'Bakery',
    overlapPct: 39,
    sequential: "39% of Rill & Row's customers pick up coffee at Basin within the hour.",
    upliftYou: 16,
    upliftThem: 25,
    terms: "Morning pairing: a Rill & Row pastry with any Basin filter at a set price.",
    tier: 1,
    monthsActive: 2,
    tierRationale:
      "A new proposal, and the uplift runs one way, so it starts small while that is watched.",
    contact: { name: 'Sofia Marchetti', role: 'Owner', email: 'sofia@rillrowbakehouse.example' },
    likedYouBack: true,
    lastActiveDays: 2,
    responseRate: 84,
    mark: { initials: 'RR', color: '#b1743f' },
    goals: ['same-industry', 'new-demographic'],
  },
  {
    id: 23,
    name: 'Latitude Travel Co.',
    shortName: 'Latitude',
    category: 'Travel agency',
    overlapPct: 19,
    sequential: "19% of Latitude's consultation bookings are followed by a Basin visit the same hour.",
    upliftYou: 9,
    upliftThem: 11,
    terms: "Consultation stop: Latitude books meetings at Basin, Basin displays Latitude's window cards.",
    tier: 1,
    monthsActive: 4,
    tierRationale:
      "A new proposal on a thin but consistent meeting pattern.",
    contact: { name: 'Emeka Nwosu', role: 'Owner', email: 'emeka@latitudetravelco.example' },
    likedYouBack: false,
    lastActiveDays: 23,
    responseRate: 37,
    mark: { initials: 'LT', color: '#4f7f8a' },
    goals: ['cross-industry', 'new-demographic'],
  },
  {
    id: 24,
    name: 'Ember Yoga Collective',
    shortName: 'Ember Yoga',
    category: 'Fitness studio',
    overlapPct: 31,
    sequential: "31% of Ember's morning class attendees order at Basin straight after.",
    upliftYou: 14,
    upliftThem: 19,
    terms: "Post-class token: any class includes a Basin drink within the hour.",
    tier: 2,
    monthsActive: 7,
    tierRationale:
      "Seven months of post-class volume that holds through the winter timetable.",
    contact: { name: 'Nadia Farrow', role: 'Founder', email: 'nadia@emberyogacollective.example' },
    likedYouBack: true,
    lastActiveDays: 3,
    responseRate: 79,
    mark: { initials: 'EY', color: '#8a5f7a' },
    goals: ['cross-industry', 'long-term', 'new-demographic'],
  },
  {
    id: 25,
    name: 'Cartwright Hardware',
    shortName: 'Cartwright',
    category: 'Hardware',
    overlapPct: 14,
    sequential: "14% overlap, mostly weekend trade customers.",
    upliftYou: 6,
    upliftThem: 8,
    terms: "Trade morning: a discounted flask refill for anyone with a Cartwright receipt.",
    tier: 1,
    monthsActive: 1,
    tierRationale:
      "A new proposal on a narrow weekend slice of both bases.",
    contact: { name: 'Roy Salazar', role: 'Owner', email: 'roy@cartwrighthardware.example' },
    likedYouBack: false,
    lastActiveDays: 38,
    responseRate: 21,
    mark: { initials: 'CH', color: '#6f6f5a' },
    goals: ['cross-industry'],
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
      'Three merchants in Downtown Loop show 30 to 44% mutual overlap, but none carries a gift line.',
    upliftRange: '+15 to 24%',
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
      'The same structural hole as Juniper & Fern: a stationery line is missing from this tight cluster.',
    upliftRange: '+12 to 20%',
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
      'A third candidate for the same gap, where a home and gift assortment fits the missing category best.',
    upliftRange: '+14 to 23%',
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
    upliftRange: '+18 to 27%',
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
