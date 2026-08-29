import type { Projection } from '../utils/projectedInsight'
import './InsightPreview.css'

interface InsightPreviewProps {
  projection: Projection
  category: string
  cluster: string
  upliftRange: string
}

const W = 320
const H = 116
const PAD = 6

function path(values: number[], min: number, max: number) {
  const span = max - min || 1
  return values
    .map((v, i) => {
      const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - min) / span) * (H - PAD * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function TrendCard({ projection }: { projection: Projection }) {
  const all = [...projection.you, ...projection.median]
  const min = Math.min(...all) * 0.985
  const max = Math.max(...all) * 1.015

  return (
    <div className="insight-card">
      <div className="insight-card-head">
        <span className="insight-card-title">Projected repeat visits</span>
        <span className="insight-card-hint">First 12 months</span>
      </div>
      <div className="insight-legend">
        <span className="insight-legend-item">
          <i className="insight-swatch insight-swatch-you" /> Your business, projected
        </span>
        <span className="insight-legend-item">
          <i className="insight-swatch insight-swatch-median" /> Cluster median today
        </span>
      </div>
      <svg className="insight-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(11,28,51,0.12)" />
        <path d={path(projection.median, min, max)} fill="none" stroke="#96a3c0" strokeWidth="1.6" strokeDasharray="4 3" />
        <path d={path(projection.you, min, max)} fill="none" stroke="#006fcf" strokeWidth="2.2" />
      </svg>
      <div className="insight-months">
        <span>Month 1</span>
        <span>Month 12</span>
      </div>
    </div>
  )
}

function LiftCard({ projection }: { projection: Projection }) {
  const rows = [
    { label: 'Repeat visits', value: projection.repeatVisitLift },
    { label: 'Basket size', value: projection.basketLift },
    { label: 'New customers', value: projection.newCustomerLift },
  ]
  const max = Math.max(...rows.map((r) => r.value)) || 1

  return (
    <div className="insight-card">
      <div className="insight-card-head">
        <span className="insight-card-title">Where the lift comes from</span>
        <span className="insight-card-hint">Projected</span>
      </div>
      <div className="insight-bars">
        {rows.map((r) => (
          <div className="insight-bar-row" key={r.label}>
            <span className="insight-bar-label">{r.label}</span>
            <span className="insight-bar-track">
              <span className="insight-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
            </span>
            <span className="insight-bar-value">+{r.value}%</span>
          </div>
        ))}
      </div>
      <p className="insight-card-note">
        Split of the projected uplift across the three behaviours the graph can
        observe for merchants like you.
      </p>
    </div>
  )
}

function HeadlineCard({
  upliftRange,
  category,
  cluster,
  cohortSize,
}: {
  upliftRange: string
  category: string
  cluster: string
  cohortSize: number
}) {
  return (
    <div className="insight-card insight-card-headline">
      <div className="insight-card-head">
        <span className="insight-card-title">Projected uplift</span>
        <span className="insight-card-hint">Category benchmark</span>
      </div>
      <div className="insight-headline-value">{upliftRange}</div>
      <p className="insight-headline-caption">
        in repeat visits for {category.toLowerCase()} merchants joining a cluster
        like {cluster}.
      </p>
      <div className="insight-headline-foot">
        Benchmarked against {cohortSize} comparable merchants
      </div>
    </div>
  )
}

/**
 * The insight a prospect would see on day one, shown before they commit.
 * Reused shape across the preview and the regenerated sample below the form.
 */
export default function InsightPreview({
  projection,
  category,
  cluster,
  upliftRange,
}: InsightPreviewProps) {
  return (
    <div className="insight-preview">
      <div className="insight-illustrative">Projected, not measured</div>
      <div className="insight-grid">
        <TrendCard projection={projection} />
        <HeadlineCard
          upliftRange={upliftRange}
          category={category}
          cluster={cluster}
          cohortSize={projection.cohortSize}
        />
        <LiftCard projection={projection} />
      </div>
      <p className="insight-disclaimer">
        Projections are shown only where at least 15 comparable merchants exist in
        the cluster, to protect anonymity and keep the benchmark statistically
        meaningful. No transaction history exists for a business before it joins,
        so every figure here is a category-level projection, not a measurement.
      </p>
    </div>
  )
}
