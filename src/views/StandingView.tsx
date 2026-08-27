import CornerBrackets from '../components/CornerBrackets'
import './StandingView.css'

// SYNTHETIC DEMO DATA. Where this merchant sits against comparable merchants,
// read from the same closed-loop transaction data that drives matching.
const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const YOU = [100, 102.4, 105.1, 104.6, 108.2, 111.5, 114.8, 116.2, 119.9, 124.4, 128.7, 136.1]
const PEERS = [100, 100.6, 101.2, 101.5, 102.4, 103.1, 103.6, 104.2, 105.1, 105.8, 106.4, 107.2]

const PERCENTILE = 88
const COHORT = 46

const BREAKDOWN = [
  { label: 'Repeat visit rate', you: 34, peers: 22, unit: '%' },
  { label: 'Average basket', you: 18.4, peers: 16.1, unit: '' , prefix: '$' },
  { label: 'New customers per month', you: 112, peers: 78, unit: '' },
  { label: 'Weekday share of sales', you: 61, peers: 68, unit: '%' },
]

const W = 640
const H = 190
const PAD = 8

function line(points: number[], min: number, max: number) {
  const span = max - min || 1
  return points
    .map((v, i) => {
      const x = PAD + (i / (points.length - 1)) * (W - PAD * 2)
      const y = H - PAD - ((v - min) / span) * (H - PAD * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export default function StandingView() {
  const all = [...YOU, ...PEERS]
  const min = Math.min(...all) * 0.99
  const max = Math.max(...all) * 1.01
  const growth = Math.round(((YOU[11] - YOU[0]) / YOU[0]) * 100)
  const peerGrowth = Math.round(((PEERS[11] - PEERS[0]) / PEERS[0]) * 100)

  return (
    <main className="standing-main">
      <div className="standing-head">
        <div className="eyebrow">Your standing</div>
        <h1>You are growing faster than most cafés in Downtown Loop</h1>
        <p>
          Read from the card transactions American Express already processes on
          your sales. No extra reporting from you, and no other merchant sees
          these figures.
        </p>
      </div>

      <div className="standing-top">
        <div className="standing-rank-card">
          <CornerBrackets />
          <div className="standing-label">Percentile, by 12 month growth</div>
          <div className="standing-rank">Top {100 - PERCENTILE}%</div>
          <div className="standing-track">
            <div className="standing-track-fill" style={{ width: `${PERCENTILE}%` }} />
            <div className="standing-track-marker" style={{ left: `${PERCENTILE}%` }} />
          </div>
          <p className="standing-rank-note">
            Against {COHORT} cafés of similar size trading in Downtown Loop.
          </p>
          <div className="standing-deltas">
            <div>
              <span className="delta-value is-up">+{growth}%</span>
              <span className="delta-label">You</span>
            </div>
            <div>
              <span className="delta-value">+{peerGrowth}%</span>
              <span className="delta-label">Peer median</span>
            </div>
          </div>
        </div>

        <div className="standing-chart-card">
          <CornerBrackets />
          <div className="standing-label">Card volume, indexed to 100</div>
          <div className="standing-legend">
            <span><i className="swatch swatch-you" /> Your business</span>
            <span><i className="swatch swatch-peers" /> Peer median</span>
          </div>
          <svg className="standing-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(11,28,51,0.12)" />
            <path className="chart-line chart-line-peers" d={line(PEERS, min, max)} fill="none" stroke="#96a3c0" strokeWidth="2" strokeDasharray="5 4" />
            <path className="chart-line chart-line-you" d={line(YOU, min, max)} fill="none" stroke="#006fcf" strokeWidth="2.6" />
          </svg>
          <div className="standing-months">
            <span>{MONTHS[0]}</span>
            <span>{MONTHS[11]}</span>
          </div>
        </div>
      </div>

      <div className="standing-breakdown">
        <div className="standing-label">Where the gap comes from</div>
        <div className="breakdown-rows">
          {BREAKDOWN.map((row, i) => {
            const ahead = row.you >= row.peers
            const max2 = Math.max(row.you, row.peers)
            return (
              <div className="breakdown-row" key={row.label} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="breakdown-label">{row.label}</div>
                <div className="breakdown-bars">
                  <div className="breakdown-bar">
                    <div
                      className={`breakdown-fill ${ahead ? 'is-ahead' : 'is-behind'}`}
                      style={{ width: `${(row.you / max2) * 100}%` }}
                    />
                    <span className="breakdown-value">
                      {row.prefix ?? ''}{row.you}{row.unit}
                    </span>
                  </div>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill is-peer" style={{ width: `${(row.peers / max2) * 100}%` }} />
                    <span className="breakdown-value is-muted">
                      {row.prefix ?? ''}{row.peers}{row.unit}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="standing-foot">
          Benchmarks appear only where at least 15 comparable merchants trade in the
          area, so no individual business can be identified from them. All figures
          here are synthetic.
        </p>
      </div>
    </main>
  )
}
