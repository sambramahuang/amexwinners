import { PROSPECT_PROFILES, GAPS, CLUSTERS } from '../data/mockData'

interface ProspectPanelProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function ProspectPanel({ selectedId, onSelect }: ProspectPanelProps) {
  const profile = PROSPECT_PROFILES.find((p) => p.id === selectedId)
  const gap = profile?.linkedGap ? GAPS.find((g) => g.id === profile.linkedGap) : null

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="eyebrow">Prong 2 · not yet an Amex merchant</span>
        <h3>Preview a prospect</h3>
      </div>

      <p className="panel-copy">
        Prospects have no Amex transaction history, so this can't be a live
        match. It's a projected preview, built from patterns already visible
        in the existing merchant graph.
      </p>

      <div className="chip-row">
        {PROSPECT_PROFILES.map((p) => (
          <button
            key={p.id}
            className={`chip ${selectedId === p.id ? 'is-active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            {p.category}
          </button>
        ))}
      </div>

      {profile && (
        <div className="match-card">
          <div className="match-card-head">
            <span className="mono match-stat">Projected uplift · {profile.upliftRange}</span>
          </div>
          <p className="match-explanation">{profile.pitch}</p>
          {gap && (
            <p className="match-explanation" style={{ color: 'var(--accent-rose)' }}>
              Linked to a detected gap in {CLUSTERS[gap.cluster].label} — see Outreach Gaps.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
