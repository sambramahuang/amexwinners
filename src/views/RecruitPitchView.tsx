import { PROSPECT_TARGETS } from '../data/graphEngineData'
import './RecruitPitchView.css'

const SHORT_LABELS = ['Juniper & Fern', 'Marlowe Paper', 'Sable & Stone', 'Cedar Recovery']

interface RecruitPitchViewProps {
  selectedIdx: number
  onSelect: (idx: number) => void
}

export default function RecruitPitchView({ selectedIdx, onSelect }: RecruitPitchViewProps) {
  const selected = PROSPECT_TARGETS[selectedIdx] ?? PROSPECT_TARGETS[0]

  return (
    <main className="pitch-main">
      <h1>Recruit pitch</h1>
      <p className="pitch-intro">
        No transaction history exists for these prospects yet, so this is a category-level projected
        preview — not a live match.
      </p>

      <div className="pitch-selector">
        {PROSPECT_TARGETS.map((p, i) => (
          <span
            key={p.id}
            className={`pitch-selector-item ${i === selectedIdx ? 'is-active' : ''}`}
            onClick={() => onSelect(i)}
          >
            {SHORT_LABELS[i] ?? p.name}
          </span>
        ))}
      </div>

      <div className="pitch-card">
        <div className="pitch-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Projected — category benchmark, not computed from live data
        </div>

        <div className="pitch-name">{selected.name}</div>
        <div className="pitch-meta">
          {selected.category} · {selected.cluster}
        </div>

        <p className="pitch-copy">{selected.pitchCopy}</p>

        <div className="pitch-uplift">
          <span className="pitch-uplift-value">{selected.upliftRange}</span>
          <span className="pitch-uplift-caption">projected uplift in repeat visits, based on similar clusters</span>
        </div>

        <div className="pitch-waiting-label">Merchants already waiting for a partner like you</div>
        <div className="pitch-waiting-grid">
          {selected.waiting.map((w) => (
            <div className="pitch-waiting-card" key={w.name}>
              <div className="pitch-waiting-name">{w.name}</div>
              <div className="pitch-waiting-why">{w.why}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary">Start application</button>
      </div>
    </main>
  )
}
