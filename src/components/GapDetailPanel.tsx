import { GAPS, CLUSTERS } from '../data/mockData'

interface GapDetailPanelProps {
  gapId: string | null
}

export default function GapDetailPanel({ gapId }: GapDetailPanelProps) {
  if (!gapId) {
    return (
      <div className="panel">
        <p className="panel-empty">
          Select a marked gap on the graph. Each one is a category missing
          from a cluster despite strong cross-cluster demand evidence —
          this is who Prong 3 recommends Amex's sales team target next,
          and why.
        </p>
      </div>
    )
  }

  const gap = GAPS.find((g) => g.id === gapId)

  if (!gap) return null

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="eyebrow">{gap.strength} · {CLUSTERS[gap.cluster].label}</span>
        <h3>Missing: {gap.missingCategory}</h3>
      </div>

      <div className="match-card">
        <p className="match-explanation">{gap.evidence}</p>
      </div>

      <div className="match-card">
        <div className="match-card-head">
          <span className="mono match-stat">Target profile</span>
        </div>
        <p className="match-explanation">{gap.targetProfile}</p>
      </div>
    </div>
  )
}
