import type { MatchCandidate } from '../data/graphEngineData'

/**
 * Circuit match score.
 *
 * One number out of 10 standing in front of the transaction data, so a merchant
 * browsing the queue reads a judgment rather than another merchant's figures.
 * Every component is a pure function of data the graph already holds, so a pair
 * always scores the same, and the weights are stated rather than hidden.
 *
 * The value-symmetry component is the one that matters most for Amex history:
 * a match where value flows one way is exactly the failure mode that sank
 * Plenti, so an asymmetric pair is marked down even when overlap looks strong.
 */
export interface ScoreComponent {
  key: string
  label: string
  weight: number
  score: number
  note: string
  detail: string
}

export interface MatchScore {
  total: number
  components: ScoreComponent[]
  tags: string[]
}

const ANCHOR_CATEGORY = 'Café'

const clamp10 = (n: number) => Math.round(Math.max(0, Math.min(10, n)) * 10) / 10

function competesWithAnchor(category: string) {
  const c = category.toLowerCase()
  return c.includes('café') || c.includes('cafe') || c.includes('coffee')
}

export function scoreCandidate(
  candidate: MatchCandidate,
  personalityFit: number | null,
): MatchScore {
  const symmetryGap = Math.abs(candidate.upliftYou - candidate.upliftThem)
  const jointUplift = (candidate.upliftYou + candidate.upliftThem) / 2
  const competes = competesWithAnchor(candidate.category)

  const components: ScoreComponent[] = [
    {
      key: 'overlap',
      label: 'Customer overlap',
      weight: 0.3,
      score: clamp10(candidate.overlapPct / 5),
      note:
        candidate.overlapPct >= 40
          ? `Strong customer overlap (${candidate.overlapPct}%)`
          : candidate.overlapPct >= 28
            ? `Solid customer overlap (${candidate.overlapPct}%)`
            : `Light customer overlap (${candidate.overlapPct}%)`,
      detail: candidate.sequential,
    },
    {
      key: 'symmetry',
      label: 'Value symmetry',
      weight: 0.25,
      score: clamp10(10 - symmetryGap * 0.8),
      note:
        symmetryGap <= 3
          ? 'Value flows both ways'
          : symmetryGap <= 6
            ? 'Slightly one sided'
            : 'One sided, worth checking',
      detail:
        symmetryGap <= 3
          ? `Projected uplift is ${candidate.upliftYou}% here against ${candidate.upliftThem}% there, close enough that neither side carries the partnership.`
          : `Projected uplift is ${candidate.upliftYou}% here against ${candidate.upliftThem}% there, a gap of ${symmetryGap} points. Asymmetric value is what sank earlier coalition schemes, so the score marks it down.`,
    },
    {
      key: 'uplift',
      label: 'Joint uplift',
      weight: 0.2,
      score: clamp10(jointUplift / 2.6),
      note:
        jointUplift >= 20
          ? 'High projected uplift'
          : jointUplift >= 14
            ? 'Moderate projected uplift'
            : 'Modest projected uplift',
      detail: `Average projected uplift across both businesses is ${jointUplift.toFixed(1)} points, drawn from cross-visit behaviour already in the graph.`,
    },
    {
      key: 'fit',
      label: 'Category complementarity',
      weight: 0.15,
      score: competes ? 4.2 : 9.5,
      note: competes ? 'Same category, competing' : 'Complementary category',
      detail: competes
        ? `Another ${candidate.category.toLowerCase()} competes with ${ANCHOR_CATEGORY.toLowerCase()} trade rather than adding to it.`
        : `A ${candidate.category.toLowerCase()} sits next to a ${ANCHOR_CATEGORY.toLowerCase()} in a customer's day without competing for the same sale.`,
    },
  ]

  if (personalityFit !== null) {
    components.push({
      key: 'preferences',
      label: 'Partnership preferences',
      weight: 0.1,
      score: clamp10(personalityFit / 10),
      note:
        personalityFit >= 70
          ? 'Matches your stated preferences'
          : 'Partly matches your preferences',
      detail:
        'Self-reported, from the optional questionnaire. Weighted lightest of the five, so transaction data still leads.',
    })
  }

  // Without the questionnaire the remaining weights are renormalised, so a
  // merchant who skips it is not silently scored out of nine.
  const weightSum = components.reduce((sum, c) => sum + c.weight, 0)
  const total = clamp10(
    components.reduce((sum, c) => sum + (c.weight / weightSum) * c.score, 0),
  )

  const tags = [...components]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => c.note)

  return { total, components, tags }
}

/** Display weight, renormalised when the questionnaire is unanswered. */
export function displayWeight(components: ScoreComponent[], c: ScoreComponent) {
  const sum = components.reduce((s, x) => s + x.weight, 0)
  return Math.round((c.weight / sum) * 100)
}
