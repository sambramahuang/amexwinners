import { useState } from 'react'
import type { View } from '../App'
import GraphCanvas from '../components/GraphCanvas'
import { INDUSTRY_CLUSTERS } from '../data/graphSceneConfigs'
import { PROSPECT_TARGETS } from '../data/graphEngineData'
import './GapRadarView.css'

interface GapRadarViewProps {
  onGeneratePitch: (prospectIdx: number, view: View) => void
}

// Pixel distance between adjacent slots on the ring. Wide enough that a peek card's
// visible sliver never sits under the current card, so it stays clickable in place.
const SLOT_SPACING = 480

// Signed distance from `current` to `index` around a ring of `total` slots, e.g. -1 for
// "one step back", +1 for "one step forward" — this is what makes it a circle: index 0
// is one step forward from index `total - 1`, not the far end of a line.
function ringOffset(index: number, current: number, total: number): number {
  const wrapped = (((index - current) % total) + total) % total
  return wrapped > total / 2 ? wrapped - total : wrapped
}

export default function GapRadarView({ onGeneratePitch }: GapRadarViewProps) {
  const [industryIdx, setIndustryIdx] = useState(0)
  const total = INDUSTRY_CLUSTERS.length
  const current = INDUSTRY_CLUSTERS[industryIdx]

  function prevIndustry() {
    setIndustryIdx((i) => (i - 1 + total) % total)
  }

  function nextIndustry() {
    setIndustryIdx((i) => (i + 1) % total)
  }

  const clusterProspects = PROSPECT_TARGETS.map((prospect, index) => ({ prospect, index })).filter(
    ({ prospect }) => prospect.cluster === current.label,
  )

  return (
    <main className="gaps-main">
      <h1>Gap radar</h1>
      <p className="gaps-intro">
        Scans the graph for clusters with strong mutual overlap but a missing category, and decides
        exactly who to target and why.
      </p>

      <div className="cluster-carousel">
        <button className="carousel-arrow" onClick={prevIndustry} aria-label="Previous industry">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="carousel-viewport">
          {INDUSTRY_CLUSTERS.map((cluster, i) => {
            const offset = ringOffset(i, industryIdx, total)
            // Only the current slot and its immediate neighbors are ever rendered — the
            // rest of the ring stays invisible until it slides into range.
            if (offset < -1 || offset > 1) return null
            const isCurrent = offset === 0

            return (
              <div
                key={cluster.id}
                className={`carousel-slot ${isCurrent ? 'is-current' : 'is-peek'}`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset * SLOT_SPACING}px) scale(${isCurrent ? 1 : 0.78})`,
                  zIndex: isCurrent ? 2 : 1,
                }}
                onClick={isCurrent ? undefined : () => setIndustryIdx(i)}
              >
                <div className="cluster-diagram-title">{cluster.label} cluster</div>
                <GraphCanvas config={cluster.graph} height={260} />
                <div className={`cluster-gap-status ${cluster.gapLabel ? 'has-gap' : 'no-gap'}`}>
                  {cluster.gapLabel ?? 'No structural gap — fully covered'}
                </div>
                <div className="cluster-diagram-caption">drag to rotate</div>
              </div>
            )
          })}
        </div>

        <button className="carousel-arrow" onClick={nextIndustry} aria-label="Next industry">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="carousel-dots">
        {INDUSTRY_CLUSTERS.map((cluster, i) => (
          <span
            key={cluster.id}
            className={`carousel-dot ${i === industryIdx ? 'is-active' : ''}`}
            onClick={() => setIndustryIdx(i)}
          />
        ))}
      </div>

      <div className="gaps-table-label">Recruit targets, ranked by gap fit</div>
      <div className="gaps-table-region">
        {clusterProspects.length > 0 ? (
          <div className="gaps-table-wrap">
            <table className="gaps-table">
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Cluster</th>
                  <th>Why this gap</th>
                  <th>Waiting</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clusterProspects.map(({ prospect, index }) => (
                  <tr key={prospect.id}>
                    <td>
                      <div className="gaps-table-name">{prospect.name}</div>
                      <div className="gaps-table-category">{prospect.category}</div>
                    </td>
                    <td>{prospect.cluster}</td>
                    <td className="gaps-table-reasoning">{prospect.reasoning}</td>
                    <td>{prospect.waiting.length} merchants</td>
                    <td className="gaps-table-action">
                      <button className="gaps-generate-btn" onClick={() => onGeneratePitch(index, 'pitch')}>
                        Generate pitch →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gaps-empty">
            {current.label} is a fully-formed cluster right now — no structural gap to recruit against.
          </div>
        )}
      </div>
    </main>
  )
}
