import {
  AMEX_REP,
  TIER_LABELS,
  type MatchCandidate,
  type MerchantContact,
  type ProspectTarget,
} from '../data/graphEngineData'

export interface OutreachEmail {
  fromName: string
  fromRole: string
  fromEmail: string
  to: MerchantContact
  subject: string
  body: string
}

const ANCHOR = 'Basin Coffee Roasters'

const signature = [
  '',
  'Best regards,',
  AMEX_REP.name,
  AMEX_REP.role,
  `${AMEX_REP.email} · ${AMEX_REP.phone}`,
].join('\n')

/**
 * The introduction sent once both merchants have matched.
 *
 * Written as a relationship manager would write it: one specific reason for
 * the email, the numbers behind it, a concrete first step, and a single easy
 * next action. No pitch, no adjectives, nothing the recipient has to decode.
 */
export function buildMatchIntroEmail(candidate: MatchCandidate): OutreachEmail {
  const symmetryGap = Math.abs(candidate.upliftYou - candidate.upliftThem)
  const tier = TIER_LABELS[candidate.tier].split('·')[1]?.trim() ?? 'Linked Offer'

  const body = [
    `Hi ${candidate.contact.name.split(' ')[0]},`,
    '',
    `I look after merchant partnerships at American Express. I am writing with something specific rather than a general introduction.`,
    '',
    `Our merchant graph paired ${candidate.name} with ${ANCHOR} this week, and both of you accepted. The pairing came out of your own card data rather than a category guess: ${candidate.sequential.charAt(0).toLowerCase()}${candidate.sequential.slice(1)}`,
    '',
    `Projected uplift sits at ${candidate.upliftThem}% for you and ${candidate.upliftYou}% for ${ANCHOR}. That is ${symmetryGap} points apart, which matters more than the headline: a partnership where the value runs one way tends not to survive the first quarter, so we flag the gap before either side commits.`,
    '',
    `Where we would start, as a ${tier.toLowerCase()}: ${candidate.terms.charAt(0).toLowerCase()}${candidate.terms.slice(1)}`,
    '',
    `Nothing to sign, and no cost to either business. If it is worth exploring, I can set up fifteen minutes with both of you this week and handle the mechanics from there.`,
    signature,
  ].join('\n')

  return {
    fromName: AMEX_REP.name,
    fromRole: AMEX_REP.role,
    fromEmail: AMEX_REP.email,
    to: candidate.contact,
    subject: `${ANCHOR} and ${candidate.name}: a partnership worth fifteen minutes`,
    body,
  }
}

/**
 * The recruitment email, sent to a merchant who is not on Amex yet.
 *
 * Same voice, but the evidence is different: a prospect has no transaction
 * history with us, so the email leads with the merchants already waiting in
 * their area rather than with numbers about them.
 */
export function buildRecruitEmail(prospect: ProspectTarget): OutreachEmail {
  const waiting = prospect.waiting.map((w) => w.name)
  const waitingLine =
    waiting.length > 1
      ? `${waiting.slice(0, -1).join(', ')} and ${waiting[waiting.length - 1]}`
      : waiting[0]

  const body = [
    `Hi ${prospect.contact.name.split(' ')[0]},`,
    '',
    `I look after merchant recruitment at American Express, and I am writing because of something we can see in ${prospect.cluster} that you probably cannot.`,
    '',
    `We track how customers move between businesses in an area. In ${prospect.cluster}, ${waitingLine} share a large part of their customer base with each other, and all three are missing the same thing: a ${prospect.category.toLowerCase()}. ${prospect.reasoning}`,
    '',
    `Merchants who fill a gap like this typically see ${prospect.upliftRange} in repeat visits within the first two quarters. That is a category benchmark drawn from comparable areas, not a promise about your business, and I would rather say so up front.`,
    '',
    `Accepting American Express would put you in that group and give you the same read on your own trading area: where you sit against merchants like you, and which businesses nearby are worth partnering with. ${prospect.waiting.length} of them have already said they are looking.`,
    '',
    `If you would like to see the figures for ${prospect.cluster} before deciding anything, I am happy to walk you through them. Fifteen minutes, no obligation.`,
    signature,
  ].join('\n')

  return {
    fromName: AMEX_REP.name,
    fromRole: AMEX_REP.role,
    fromEmail: AMEX_REP.email,
    to: prospect.contact,
    subject: `${prospect.cluster}: ${prospect.waiting.length} merchants are looking for a ${prospect.category.toLowerCase()}`,
    body,
  }
}

/** The merchant sending it: who Connexion is acting for in the SME view. */
export const SELF_MERCHANT = {
  name: 'Basin Coffee Roasters',
  category: 'café',
  neighbourhood: 'Downtown Loop',
  opened: 2019,
  weeklyCustomers: 1400,
  known: 'single origin filter and a small pastry counter',
  contact: { name: 'Rae Halloran', role: 'Owner', email: 'rae@basincoffee.example' },
}

/**
 * Merchant to merchant, sent by the SME rather than by Amex.
 *
 * A different job from the relationship manager's email: the recipient does
 * not know this business, so it opens with who they are and what they run
 * before it proposes anything. Short, concrete, and it asks for one small
 * thing rather than a partnership in principle.
 */
export function buildMerchantIntroEmail(candidate: MatchCandidate): OutreachEmail {
  const me = SELF_MERCHANT
  const body = [
    `Hi ${candidate.contact.name.split(' ')[0]},`,
    '',
    `I am ${me.contact.name}, I own ${me.name}, the ${me.category} on ${me.neighbourhood}. We opened in ${me.opened} and serve around ${me.weeklyCustomers.toLocaleString('en-US')} customers a week, mostly regulars, and we are known for ${me.known}.`,
    '',
    `American Express matched our two businesses through Connexion, which reads how customers move between merchants in the area. What it found: ${candidate.sequential.charAt(0).toLowerCase()}${candidate.sequential.slice(1)} I had no idea the overlap was that high, and it seems like a waste not to do something with it.`,
    '',
    `What I have in mind is small to start: ${candidate.terms.charAt(0).toLowerCase()}${candidate.terms.slice(1)} No exclusivity, no cost to either of us, and we can stop it at any point if it is not pulling its weight.`,
    '',
    `If you are open to it, could I come by this week and introduce myself properly? I would rather sort it out over a coffee than over email, and the coffee is on me.`,
    '',
    'Best,',
    me.contact.name,
    `${me.contact.role}, ${me.name}`,
    me.contact.email,
  ].join('\n')

  return {
    fromName: me.contact.name,
    fromRole: `${me.contact.role}, ${me.name}`,
    fromEmail: me.contact.email,
    to: candidate.contact,
    subject: `${me.name} nearby, an idea worth a coffee`,
    body,
  }
}
