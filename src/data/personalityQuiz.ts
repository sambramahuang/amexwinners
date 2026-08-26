// -----------------------------------------------------------------------
// Merchant partnership-preferences questionnaire — a short, self-reported
// qualitative layer that sits ON TOP OF the real closed-loop transaction
// signal (overlapPct, sequential, upliftYou/upliftThem). It never replaces
// that data; it only nudges ranking and adds color to the AI explanation.
// See computePersonalityFit in personalityFit.ts for how it's blended in.
// -----------------------------------------------------------------------

export interface PersonalityOption {
  label: string
  tags: string[]
}

export interface PersonalityQuestion {
  id: string
  prompt: string
  /** 'avoid' questions capture disqualifiers — matching tags penalize fit instead of boosting it. */
  kind: 'like' | 'avoid'
  options: PersonalityOption[]
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'customer-vibe',
    prompt: 'How would you describe a typical Basin visit?',
    kind: 'like',
    options: [
      { label: 'Extended stay — customers linger with a book or laptop', tags: ['slow-browse', 'community'] },
      { label: 'Quick and convenience-driven — most visits are on the go', tags: ['fast-paced', 'convenience'] },
      { label: 'Occasion-driven — customers treat it as a deliberate outing', tags: ['occasion', 'brand-aesthetic'] },
      { label: 'Habitual — regulars who visit on a near-daily cadence', tags: ['community', 'ritual'] },
    ],
  },
  {
    id: 'green-flag',
    prompt: 'What matters most when evaluating a potential partner?',
    kind: 'like',
    options: [
      { label: 'Overlapping customer base — their regulars resemble ours', tags: ['community', 'shared-regulars'] },
      { label: 'Brand and aesthetic alignment — the pairing reads as coherent', tags: ['brand-aesthetic', 'occasion'] },
      { label: "Demonstrated follow-through — they'll actively promote the partnership", tags: ['low-maintenance', 'shared-events'] },
      { label: 'Operational compatibility — similar pace, low coordination overhead', tags: ['low-maintenance', 'ritual'] },
    ],
  },
  {
    id: 'love-language',
    prompt: 'Which partnership structure works best for Basin?',
    kind: 'like',
    options: [
      { label: 'Bundled discount or joint loyalty program', tags: ['convenience', 'shared-regulars'] },
      { label: 'Co-hosted events or cross-promotions', tags: ['shared-events', 'occasion'] },
      { label: 'Referral-based — warm handoffs between customer bases', tags: ['community', 'shared-regulars'] },
      { label: 'Co-branded product or menu collaboration', tags: ['brand-aesthetic', 'occasion'] },
    ],
  },
  {
    id: 'dealbreaker',
    prompt: 'What would disqualify a potential partner?',
    kind: 'avoid',
    options: [
      { label: 'Purely transactional — no shared brand narrative', tags: ['community', 'ritual'] },
      { label: 'Inconsistent hours or unreliable follow-through', tags: ['low-maintenance'] },
      { label: 'Aesthetic mismatch that customers would notice', tags: ['brand-aesthetic'] },
      { label: 'One-sided benefit — they gain traffic without reciprocating', tags: ['shared-regulars', 'shared-events'] },
    ],
  },
]

export interface PersonalityAnswer {
  questionId: string
  prompt: string
  label: string
  kind: 'like' | 'avoid'
  tags: string[]
}

export interface PersonalityProfile {
  answers: PersonalityAnswer[]
  likedTags: string[]
  avoidTags: string[]
}

export function buildPersonalityProfile(answers: PersonalityAnswer[]): PersonalityProfile {
  const likedTags = [...new Set(answers.filter((a) => a.kind === 'like').flatMap((a) => a.tags))]
  const avoidTags = [...new Set(answers.filter((a) => a.kind === 'avoid').flatMap((a) => a.tags))]
  return { answers, likedTags, avoidTags }
}
