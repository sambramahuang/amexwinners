import { useMemo, useState } from 'react'
import type { View } from '../App'
import { CLUSTERS, GROWING_MERCHANTS, type GrowingMerchant } from '../data/growthRadar'
import './GrowthRadarView.css'

const W = 108
const H = 30

/** Sparkline drawn from the merchant's own 12 month series. */
function Spark({ points, muted }: { points: number[]; muted: boolean }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W
      const y = H - ((v - min) / span) * H
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const last = points[points.length - 1]
  const lastY = H - ((last - min) / span) * H

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H + 4}`} width={W} height={H + 4} aria-hidden="true">
      <path d={d} fill="none" stroke={muted ? '#8a97ac' : '#006fcf'} strokeWidth="1.6" />
      <circle cx={W} cy={lastY} r="2.6" fill={muted ? '#8a97ac' : '#006fcf'} />
    </svg>
  )
}

interface GrowthRadarViewProps {
  onNavigate: (view: View) => void
}

export default function GrowthRadarView({ onNavigate }: GrowthRadarViewProps) {
  const [cluster, setCluster] = useState(CLUSTERS[0])
  const [onlyProspects, setOnlyProspects] = useState(false)

  const rows = useMemo<GrowingMerchant[]>(() => {
    return GROWING_MERCHANTS.filter(
      (m) =>
        (cluster === CLUSTERS[0] || m.cluster === cluster) &&
        (!onlyProspects || !m.onAmex),
    )
  }, [cluster, onlyProspects])

  const prospects = rows.filter((m) => !m.onAmex).length

  return (
    <main className="growth-main">
      <div className="growth-head">
        <div className="eyebrow">Growth radar</div>
        <h1>The 20 fastest growing merchants in the region</h1>
        <p>
          Ranked on 12 month card volume growth. {prospects} of the {rows.length}{' '}
          shown are not on Amex yet, which is the point: the radar sees a business
          before it is a customer.
        </p>
      </div>

      <div className="growth-controls">
        <div className="growth-filters">
          {CLUSTERS.map((c) => (
            <button
              key={c}
              className={`filter-pill ${c === cluster ? 'is-active' : ''}`}
              onClick={() => setCluster(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          className={`filter-pill filter-pill-toggle ${onlyProspects ? 'is-active' : ''}`}
          onClick={() => setOnlyProspects((v) => !v)}
        >
          Not on Amex only
        </button>
      </div>

      <div className="growth-list">
        {rows.map((m, i) => (
          <div
            className="growth-row"
            key={m.id}
            style={{ animationDelay: `${Math.min(i, 14) * 34}ms` }}
          >
            <div className="growth-rank">{String(i + 1).padStart(2, '0')}</div>

            <div className="growth-identity">
              <div className="growth-name">{m.name}</div>
              <div className="growth-meta">
                {m.category} · {m.cluster} · {m.volumeBand} per month
              </div>
            </div>

            <Spark points={m.series} muted={!m.onAmex} />

            <div className="growth-pct">
              <span className="growth-pct-value">+{m.growthPct}%</span>
              <span className="growth-pct-label">12 mo</span>
            </div>

            <div className="growth-status">
              {m.onAmex ? (
                <span className="status-chip is-on">On Amex</span>
              ) : (
                <button className="status-chip is-off" onClick={() => onNavigate('pitch')}>
                  Recruit
                </button>
              )}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="growth-empty">No merchants match this filter.</div>
        )}
      </div>

      <p className="growth-foot">
        Growth is read from card network and acquiring data across the region, so a
        merchant appears here whether or not they accept Amex today. Figures are
        synthetic.
      </p>
    </main>
  )
}
