import { useState } from 'react'
import CornerBrackets from '../components/CornerBrackets'
import './StandingView.css'

// SYNTHETIC DEMO DATA. Monthly card sales for this merchant against the median
// café of similar size in the same trading area, read from the closed-loop
// transaction data. Sales only: growth rate and percentile were two more
// numbers saying the same thing, and they contradicted each other at a glance.
const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const SALES = [
  36400, 35100, 37800, 33900, 34600, 36200, 38100, 37400, 39600, 40200, 41800, 42600,
]
const PEER_SALES = [
  41200, 40600, 42300, 39800, 40100, 41500, 43200, 43900, 45100, 45800, 46400, 47300,
]

const COHORT = 46
const AREA = 'Downtown Loop'

const W = 640
const H = 210
const PAD_X = 10
const PAD_Y = 16

const money = (n: number) => `$${n.toLocaleString('en-US')}`

export default function StandingView({
  onNavigate,
}: {
  onNavigate?: (view: 'match') => void
}) {
  const [hover, setHover] = useState<number | null>(null)

  const last = SALES[SALES.length - 1]
  const peerLast = PEER_SALES[PEER_SALES.length - 1]
  const gapPct = Math.round(((peerLast - last) / peerLast) * 100)
  const behind = gapPct > 0
  const monthlyGap = Math.abs(peerLast - last)

  const all = [...SALES, ...PEER_SALES]
  const min = Math.min(...all) * 0.94
  const max = Math.max(...all) * 1.03
  const point = (v: number, i: number) => {
    const x = PAD_X + (i / (SALES.length - 1)) * (W - PAD_X * 2)
    const y = H - PAD_Y - ((v - min) / (max - min)) * (H - PAD_Y * 2)
    return [x, y] as const
  }
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${point(v, i).map((n) => n.toFixed(1)).join(',')}`).join(' ')


  return (
    <main className="standing-main">
      <div className="standing-head">
        <div className="eyebrow">Your sales</div>
        <h1>{money(last)} in card sales last month</h1>
        <p>
          The median café of your size in {AREA} took {money(peerLast)}. Read from
          the transactions American Express already processes on your sales, with
          no extra reporting from you.
        </p>
      </div>

      <div className="sales-card">
        <CornerBrackets />

        <div className="sales-compare">
          <div className="sales-figure">
            <span className="sales-figure-label">You</span>
            <span className="sales-figure-value">{money(last)}</span>
          </div>
          <div className="sales-figure is-peer">
            <span className="sales-figure-label">Median café nearby</span>
            <span className="sales-figure-value">{money(peerLast)}</span>
          </div>
          <div className={`sales-gap ${behind ? 'is-behind' : 'is-ahead'}`}>
            {Math.abs(gapPct)}% {behind ? 'behind' : 'ahead'}
          </div>
        </div>

        <div className="sales-legend">
          <span><i className="swatch swatch-you" /> Your sales</span>
          <span><i className="swatch swatch-peers" /> Median café nearby</span>
        </div>

        <div className="sales-plot">
          {hover !== null && (
            <div
              className="sales-tip"
              style={{
                left: `${(point(SALES[hover], hover)[0] / W) * 100}%`,
                top: `${(point(SALES[hover], hover)[1] / H) * 100}%`,
              }}
            >
              <span className="sales-tip-month">{MONTHS[hover]}</span>
              <span className="sales-tip-value">{money(SALES[hover])}</span>
              <span className="sales-tip-peer">
                median {money(PEER_SALES[hover])}
              </span>
              <span
                className={`sales-tip-gap ${
                  SALES[hover] >= PEER_SALES[hover] ? 'is-ahead' : 'is-behind'
                }`}
              >
                {Math.abs(
                  Math.round(
                    ((SALES[hover] - PEER_SALES[hover]) / PEER_SALES[hover]) * 100,
                  ),
                )}
                % {SALES[hover] >= PEER_SALES[hover] ? 'ahead' : 'behind'}
              </span>
            </div>
          )}
          <svg className="sales-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <path className="chart-line chart-line-peers" d={path(PEER_SALES)} fill="none" />
          <path className="chart-line chart-line-you" d={path(SALES)} fill="none" />
          {SALES.map((v, i) => {
            const [x, y] = point(v, i)
            return (
              <g key={MONTHS[i]}>
                <circle className={`chart-point ${hover === i ? 'is-on' : ''}`} cx={x} cy={y} r="4.5" />
                <rect
                  x={x - (W - PAD_X * 2) / 24}
                  y="0"
                  width={(W - PAD_X * 2) / 12}
                  height={H}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                />
              </g>
            )
          })}
          </svg>

          {/* A guide line, so the hovered month is unmistakable. */}
          {hover !== null && (
            <div
              className="sales-guide"
              style={{ left: `${(point(SALES[hover], hover)[0] / W) * 100}%` }}
            />
          )}
        </div>

        <div className="sales-months">
          <span>{MONTHS[0]}</span>
          {hover === null && <span className="sales-months-hint">Hover any month</span>}
          <span>{MONTHS[MONTHS.length - 1]}</span>
        </div>
      </div>

      {behind && (
        <div className="standing-action">
          <CornerBrackets />
          <div className="standing-action-head">
            <span className="standing-action-flag">Behind the median</span>
            <span className="standing-action-figure">{money(monthlyGap)} a month</span>
          </div>
          <p className="standing-action-copy">
            You are <strong>{gapPct}% behind the median café</strong> of your size in{' '}
            {AREA}, across {COHORT} comparable merchants. Most of the gap sits on
            weekday afternoons, when your sales fall furthest below theirs.
          </p>
          <p className="standing-action-rec">
            <strong>Recommended:</strong> cafés that closed a gap like this did it by
            partnering with a business whose customers arrive when they are quiet.
            Circuit has <span className="standing-action-count">8</span> nearby that fit.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate?.('match')}>
            Open matching
          </button>
        </div>
      )}

      <p className="standing-foot">
        Comparisons appear only where at least 15 comparable merchants trade in the
        area, so no individual business can be identified from them. All figures
        here are synthetic.
      </p>
    </main>
  )
}
