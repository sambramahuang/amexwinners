import { useState } from 'react'
import { PROSPECT_TARGETS } from '../data/graphEngineData'
import EmailComposer from '../components/EmailComposer'
import { buildRecruitEmail } from '../utils/outreachEmails'
import './RecruitPitchView.css'

const SHORT_LABELS = ['Juniper & Fern', 'Marlowe Paper', 'Sable & Stone', 'Cedar Recovery']

interface RecruitPitchViewProps {
  selectedIdx: number
  onSelect: (idx: number) => void
}

export default function RecruitPitchView({ selectedIdx, onSelect }: RecruitPitchViewProps) {
  const selected = PROSPECT_TARGETS[selectedIdx] ?? PROSPECT_TARGETS[0]
  // Everyone is in the campaign by default; deselect the ones you are not ready
  // to approach rather than building the list up from nothing.
  const [campaign, setCampaign] = useState<number[]>(() => PROSPECT_TARGETS.map((p) => p.id))

  const inCampaign = PROSPECT_TARGETS.filter((p) => campaign.includes(p.id))
  const preview = campaign.includes(selected.id) ? selected : inCampaign[0]

  function toggleCampaign(id: number) {
    setCampaign((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))
  }

  return (
    <main className="pitch-main">
      <h1>Recruit pitch</h1>
      <p className="pitch-intro">
        No transaction history exists for these prospects yet, so this is a category level projected
        preview rather than a live match.
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
          Projected. A category benchmark, not computed from live data.
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

      <section className="pitch-outreach">
        <div className="pitch-section-title-row">
          <h2 className="pitch-section-title">Recruitment email</h2>
          <span className="pitch-outreach-count">
            {inCampaign.length} of {PROSPECT_TARGETS.length} selected
          </span>
        </div>
        <p className="pitch-outreach-copy">
          One email, written per prospect out of their own cluster's evidence: the
          merchants already waiting, the gap they would fill, and the category
          benchmark, all named. Pick who it goes to, read the version they will
          actually receive, then dispatch to the whole list at once.
        </p>

        <div className="pitch-outreach-picker">
          {PROSPECT_TARGETS.map((p) => (
            <button
              key={p.id}
              className={`filter-pill ${campaign.includes(p.id) ? 'is-active' : ''}`}
              onClick={() => toggleCampaign(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        {preview ? (
          <>
            <div className="pitch-outreach-preview">
              Previewing the version for <strong>{preview.name}</strong>. Each
              recipient gets their own cluster's figures.
            </div>
            <EmailComposer
              email={buildRecruitEmail(preview)}
              sendLabel={`Dispatch to ${inCampaign.length} merchant${inCampaign.length === 1 ? '' : 's'}`}
              sentLabel={`Dispatched to ${inCampaign.length}`}
              recipients={inCampaign.map((p) => ({ name: p.name, email: p.contact.email }))}
            />
          </>
        ) : (
          <div className="pitch-outreach-empty">
            Select at least one merchant to dispatch to.
          </div>
        )}
      </section>
    </main>
  )
}
