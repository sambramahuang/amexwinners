import { useMemo, useState } from 'react'
import { PROSPECT_TARGETS } from '../data/graphEngineData'
import InsightPreview from '../components/InsightPreview'
import { buildProjection } from '../utils/projectedInsight'
import './RecruitPitchView.css'

const SHORT_LABELS = ['Juniper & Fern', 'Marlowe Paper', 'Sable & Stone', 'Cedar Recovery']

const CATEGORIES = [
  'Gift shop',
  'Stationery',
  'Home & gift',
  'Bookstore',
  'Florist',
  'Fitness studio',
]

const REVENUE_BANDS = ['Under $10k', '$10k to $50k', '$50k to $200k', '$200k+']

// Band and category shift the projection deterministically, so the same
// selection always previews the same figures.
function seedFor(category: string, band: string) {
  const text = `${category}|${band}`
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface RecruitPitchViewProps {
  selectedIdx: number
  onSelect: (idx: number) => void
}

export default function RecruitPitchView({ selectedIdx, onSelect }: RecruitPitchViewProps) {
  const selected = PROSPECT_TARGETS[selectedIdx] ?? PROSPECT_TARGETS[0]
  const [category, setCategory] = useState(CATEGORIES[0])
  const [band, setBand] = useState(REVENUE_BANDS[1])
  const [custom, setCustom] = useState<{ category: string; band: string } | null>(null)

  const projection = useMemo(
    () => buildProjection(selected.id * 7919, selected.upliftRange),
    [selected],
  )

  const customProjection = useMemo(() => {
    if (!custom) return null
    return buildProjection(seedFor(custom.category, custom.band), selected.upliftRange)
  }, [custom, selected.upliftRange])

  return (
    <main className="pitch-main">
      <div className="pitch-eyebrow">For businesses not yet on Amex</div>
      <h1>See what your business could look like on Amex</h1>
      <p className="pitch-intro">
        Amex sees both sides of a card sale: the buyer and the business. For a
        merchant already on the network that becomes a live read on who to grow
        with. You are not on it yet, so what follows is a projection from merchants
        like you in this cluster, not a live match.
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
        <div className="pitch-name">{selected.name}</div>
        <div className="pitch-meta">
          {selected.category} · {selected.cluster}
        </div>
        <p className="pitch-copy">{selected.pitchCopy}</p>
        <div className="pitch-reasoning">{selected.reasoning}</div>
      </div>

      <section className="pitch-section">
        <h2 className="pitch-section-title">A sample insight, the day you join</h2>
        <InsightPreview
          projection={projection}
          category={selected.category}
          cluster={selected.cluster}
          upliftRange={selected.upliftRange}
        />
      </section>

      <section className="pitch-section">
        <h2 className="pitch-section-title">Merchants already waiting for a partner like you</h2>
        <div className="pitch-waiting-grid">
          {selected.waiting.map((w) => (
            <div className="pitch-waiting-card" key={w.name}>
              <div className="pitch-waiting-name">{w.name}</div>
              <div className="pitch-waiting-why">{w.why}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pitch-section pitch-locked-section">
        <div>
          <h2 className="pitch-section-title">And a matching queue you cannot see yet</h2>
          <p className="pitch-locked-copy">
            Merchants on the network get a ranked queue of complementary partners,
            each with the score behind it and a check that value flows both ways.
            Joining unlocks it, and puts you in other merchants' queues too.
          </p>
          <div className="pitch-locked-chips">
            <span className="reason-chip">Opt in only</span>
            <span className="reason-chip">Contact details released on mutual connect</span>
            <span className="reason-chip">Explainable scores</span>
          </div>
        </div>

        <div className="pitch-locked-card">
          <div className="pitch-locked-blur">
            <div className="pitch-locked-score">8.6</div>
            <div className="pitch-locked-name">Spinebound Books</div>
            <div className="pitch-locked-meta">Bookstore · Downtown Loop</div>
            <div className="pitch-locked-bar" />
            <div className="pitch-locked-bar short" />
            <div className="pitch-locked-bar" />
          </div>
          <div className="pitch-locked-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 9V7a5 5 0 0 0-10 0v2H5.5A1.5 1.5 0 0 0 4 10.5v9A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 18.5 9H17Zm-8 0V7a3 3 0 1 1 6 0v2H9Z" />
            </svg>
            <div className="pitch-locked-title">Unlock the matching queue</div>
            <div className="pitch-locked-sub">
              Join the merchants already finding partners in {selected.cluster}.
            </div>
          </div>
        </div>
      </section>

      <section className="pitch-cta">
        <h2 className="pitch-cta-title">See your projected insight</h2>
        <p className="pitch-cta-copy">
          Pick your category and monthly card revenue. Circuit generates a
          projection for a business of that shape, drawn from the same cluster
          patterns. Projected figures, real format.
        </p>

        <form
          className="pitch-cta-form"
          onSubmit={(e) => {
            e.preventDefault()
            setCustom({ category, band })
          }}
        >
          <label className="pitch-field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="pitch-field">
            <span>Monthly card revenue</span>
            <select value={band} onChange={(e) => setBand(e.target.value)}>
              {REVENUE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-primary" type="submit">
            See your projected insight
          </button>
        </form>

        {custom && customProjection && (
          <div className="pitch-cta-result">
            <div className="pitch-cta-result-label">
              Projected benchmark · {custom.category} · {custom.band} per month
            </div>
            <InsightPreview
              projection={customProjection}
              category={custom.category}
              cluster={selected.cluster}
              upliftRange={selected.upliftRange}
            />
          </div>
        )}

        <button className="btn btn-primary pitch-apply">Start application</button>
      </section>
    </main>
  )
}
