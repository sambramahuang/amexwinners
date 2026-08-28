import { useMemo, useState } from 'react'
import type { View } from '../App'
import { US_CITIES, US_MERCHANTS, type UsMerchant } from '../data/usMerchants'
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
  const [city, setCity] = useState(US_CITIES[0])
  const [onlyProspects, setOnlyProspects] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const matching = useMemo<UsMerchant[]>(
    () =>
      US_MERCHANTS.filter(
        (m) =>
          (city === US_CITIES[0] || m.city === city) &&
          (!onlyProspects || !m.onAmex),
      ).sort((a, b) => b.growthPct - a.growthPct),
    [city, onlyProspects],
  )

  const rows = showAll ? matching : matching.slice(0, 20)
  const prospects = rows.filter((m) => !m.onAmex).length

  return (
    <main className="growth-main">
      <div className="growth-head">
        <div className="eyebrow">Growth radar</div>
        <h1>
          The fastest growing small businesses in {city === US_CITIES[0] ? 'the US' : city}
        </h1>
        <p>
          Ranked on 12 month card volume growth, drawn from {US_MERCHANTS.length}{' '}
          merchants across {US_CITIES.length - 1} cities. {prospects} of the{' '}
          {rows.length} shown are not on Amex yet, which is the point: the radar
          sees a business before it is a customer.
        </p>
      </div>

      <div className="growth-controls">
        <div className="growth-filters">
          {US_CITIES.map((c) => (
            <button
              key={c}
              className={`filter-pill ${c === city ? 'is-active' : ''}`}
              onClick={() => {
                setCity(c)
                setShowAll(false)
              }}
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
                {m.category} · {m.neighbourhood}, {m.city} {m.state} · {m.volumeBand}{' '}
                per month
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

      {matching.length > 20 && (
        <button className="btn btn-ghost growth-more" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show the top 20' : `Show all ${matching.length}`}
        </button>
      )}

      <p className="growth-foot">
        Growth is read from card network and acquiring data across the region, so a
        merchant appears here whether or not they accept Amex today. Figures are
        synthetic.
      </p>
    </main>
  )
}
