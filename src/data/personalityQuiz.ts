// -----------------------------------------------------------------------
// Brand words — a short, self-reported qualitative layer that sits ON TOP OF
// the real closed-loop transaction signal (overlapPct, sequential,
// upliftYou/upliftThem). It never replaces that data; it only nudges ranking
// and adds colour to the AI explanation. A merchant picks three words for
// their own business, which is faster and truer than answering four multiple
// choice questions about themselves.
// See computePersonalityFit in personalityFit.ts for how it is blended in.
// -----------------------------------------------------------------------

export interface BrandWord {
  word: string
  /** What the word implies about how this merchant trades. */
  meaning: string
  tags: string[]
}

export const BRAND_WORDS: BrandWord[] = [
  { word: 'Unhurried', meaning: 'People stay a while', tags: ['slow-browse', 'ritual'] },
  { word: 'Neighbourly', meaning: 'Regulars from nearby', tags: ['community', 'shared-regulars'] },
  { word: 'Crafted', meaning: 'Made with care, and it shows', tags: ['brand-aesthetic', 'occasion'] },
  { word: 'Dependable', meaning: 'Same standard every visit', tags: ['low-maintenance', 'ritual'] },
  { word: 'Quick', meaning: 'In, out, on with the day', tags: ['fast-paced', 'convenience'] },
  { word: 'Social', meaning: 'People come to meet people', tags: ['shared-events', 'community'] },
  { word: 'Considered', meaning: 'Nothing here is accidental', tags: ['brand-aesthetic', 'slow-browse'] },
  { word: 'Everyday', meaning: 'Part of the routine', tags: ['ritual', 'convenience'] },
  { word: 'Celebratory', meaning: 'Marks an occasion', tags: ['occasion', 'shared-events'] },
  { word: 'Warm', meaning: 'Known by name', tags: ['community', 'shared-regulars'] },
  { word: 'Precise', meaning: 'Runs like clockwork', tags: ['low-maintenance', 'brand-aesthetic'] },
  { word: 'Independent', meaning: 'Nobody else does it this way', tags: ['brand-aesthetic', 'community'] },
  { word: 'Generous', meaning: 'Gives more than expected', tags: ['shared-regulars', 'shared-events'] },
  { word: 'Understated', meaning: 'Quiet quality, no shouting', tags: ['slow-browse', 'low-maintenance'] },
  { word: 'Energetic', meaning: 'Fast, loud, alive', tags: ['fast-paced', 'shared-events'] },
]

export const WORDS_REQUIRED = 3

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
  /** The three words as picked, in order, for display. */
  words: string[]
}

export function buildProfileFromWords(picked: BrandWord[]): PersonalityProfile {
  const answers: PersonalityAnswer[] = picked.map((w) => ({
    questionId: `brand-word-${w.word.toLowerCase()}`,
    prompt: 'Three words for this business',
    label: w.word,
    kind: 'like',
    tags: w.tags,
  }))
  return {
    answers,
    likedTags: [...new Set(picked.flatMap((w) => w.tags))],
    avoidTags: [],
    words: picked.map((w) => w.word),
  }
}
