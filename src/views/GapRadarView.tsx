import { useLayoutEffect, useRef, useState } from 'react'
import GraphCanvas from '../components/GraphCanvas'
import { INDUSTRY_CLUSTERS } from '../data/graphSceneConfigs'
import { PROSPECT_TARGETS, type ProspectTarget } from '../data/graphEngineData'
import { scoreProspect } from '../utils/prospectScore'
import { findGrowingMatches } from '../utils/gapMatch'
import './GapRadarView.css'

interface GapRadarViewProps {
  onGeneratePitch: (prospectIdx: number) => void
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

function prospectsForCluster(label: string): { prospect: ProspectTarget; index: number }[] {
  return PROSPECT_TARGETS.map((prospect, index) => ({ prospect, index }))
    .filter(({ prospect }) => prospect.cluster === label)
    // Best bet for Amex first, not just declaration order.
    .sort((a, b) => scoreProspect(b.prospect) - scoreProspect(a.prospect))
}

interface RecruitTableProps {
  clusterLabel: string
  prospects: { prospect: ProspectTarget; index: number }[]
  onGeneratePitch: (prospectIdx: number) => void
}

function RecruitTable({ clusterLabel, prospects, onGeneratePitch }: RecruitTableProps) {
  if (prospects.length === 0) {
    return (
      <div className="gaps-empty">
        {clusterLabel} is a fully-formed cluster right now — no structural gap to recruit against.
      </div>
    )
  }

  return (
    <div className="gaps-table-wrap">
      <table className="gaps-table">
        <thead>
          <tr>
            <th>Prospect</th>
            <th>Cluster</th>
            <th>Why this gap</th>
            <th>Waiting</th>
            <th>Amex fit</th>
            <th>Growing match</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {prospects.map(({ prospect, index }) => {
            const growing = findGrowingMatches(prospect)
            const best = growing[0]
            return (
              <tr key={prospect.id}>
                <td>
                  <div className="gaps-table-name">{prospect.name}</div>
                  <div className="gaps-table-category">{prospect.category}</div>
                </td>
                <td>{prospect.cluster}</td>
                <td className="gaps-table-reasoning">{prospect.reasoning}</td>
                <td>{prospect.waiting.length} merchants</td>
                <td className="gaps-table-fit">{scoreProspect(prospect)}</td>
                <td className="gaps-table-growing">
                  {best ? (
                    <div
                      title={
                        growing.length > 1
                          ? `${growing.length} real businesses growing to match this gap`
                          : undefined
                      }
                    >
                      <span className="gaps-table-growing-pct">+{best.merchant.growthPct}%</span>{' '}
                      <span className="gaps-table-growing-name">{best.merchant.name}</span>
                      {growing.length > 1 && (
                        <span className="gaps-table-growing-more"> +{growing.length - 1} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="gaps-table-growing-empty">No live match yet</span>
                  )}
                </td>
                <td className="gaps-table-action">
                  <button className="gaps-generate-btn" onClick={() => onGeneratePitch(index)}>
                    Generate pitch →
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function GapRadarView({ onGeneratePitch }: GapRadarViewProps) {
  const [industryIdx, setIndustryIdx] = useState(0)
  const total = INDUSTRY_CLUSTERS.length
  const current = INDUSTRY_CLUSTERS[industryIdx]

  // The recruit table's height varies a lot by cluster — some have three rows of
  // wrapped reasoning text, some are the empty "fully covered" message. Switching
  // industries with no fixed height reserved makes the whole page below it (and the
  // footer) jump on every click. Rather than guess a pixel value that goes stale the
  // next time a prospect gets added, measure every cluster's real rendered height
  // once (via a zero-footprint hidden probe) and reserve the tallest.
  const probeRef = useRef<HTMLDivElement>(null)
  const [minRegionHeight, setMinRegionHeight] = useState(0)

  useLayoutEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    const heights = Array.from(probe.children).map((child) => (child as HTMLElement).offsetHeight)
    setMinRegionHeight(Math.max(0, ...heights))
  }, [])

  function prevIndustry() {
    setIndustryIdx((i) => (i - 1 + total) % total)
  }

  function nextIndustry() {
    setIndustryIdx((i) => (i + 1) % total)
  }

  const clusterProspects = prospectsForCluster(current.label)

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
            // The visible sliver of a peek card is always its inner edge (the
            // side facing the current card) — for the left peek that's its own
            // right side, so its title needs to read from that end instead of
            // the left-aligned default, or it'd be clipped before ever showing.
            const roleClass = isCurrent ? 'is-current' : offset < 0 ? 'is-peek is-prev' : 'is-peek is-next'

            return (
              <div
                key={cluster.id}
                className={`carousel-slot ${roleClass}`}
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

      <div className="gaps-table-label">Recruit targets, ranked by fit for Amex</div>

      <div className="gaps-table-probe-anchor" aria-hidden="true">
        <div className="gaps-table-probe" ref={probeRef}>
          {INDUSTRY_CLUSTERS.map((cluster) => (
            <RecruitTable
              key={cluster.id}
              clusterLabel={cluster.label}
              prospects={prospectsForCluster(cluster.label)}
              onGeneratePitch={() => {}}
            />
          ))}
        </div>
      </div>

      <div className="gaps-table-region" style={{ minHeight: minRegionHeight || undefined }}>
        <RecruitTable
          clusterLabel={current.label}
          prospects={clusterProspects}
          onGeneratePitch={onGeneratePitch}
        />
      </div>
    </main>
  )
}
