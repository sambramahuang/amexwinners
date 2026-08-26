import './BenefitCharts.css'

interface BenefitBarChartProps {
  youLabel: string
  themLabel: string
  youValue: number
  themValue: number
}

/** Horizontal bar comparison of projected uplift for both merchants. */
export function BenefitBarChart({ youLabel, themLabel, youValue, themValue }: BenefitBarChartProps) {
  const niceMax = Math.max(20, Math.ceil(Math.max(youValue, themValue) / 5) * 5)
  const ticks = [0, niceMax / 2, niceMax]
  const trackWidth = 220
  const scale = (v: number) => (v / niceMax) * trackWidth

  const rows = [
    { label: youLabel, value: youValue, className: 'benefit-bar-you' },
    { label: themLabel, value: themValue, className: 'benefit-bar-them' },
  ]

  return (
    <div className="benefit-chart">
      <svg viewBox={`0 0 280 92`} className="benefit-bar-svg" role="img" aria-label="Projected uplift by merchant">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={44 + scale(t)} y1={4} x2={44 + scale(t)} y2={72} className="benefit-gridline" />
            <text x={44 + scale(t)} y={86} className="benefit-tick-label" textAnchor="middle">
              {t}%
            </text>
          </g>
        ))}
        <line x1={44} y1={4} x2={44} y2={72} className="benefit-baseline" />
        {rows.map((row, i) => {
          const y = 18 + i * 36
          return (
            <g key={row.label}>
              <text x={38} y={y + 5} className="benefit-row-label" textAnchor="end">
                {row.label}
              </text>
              <rect x={44} y={y - 7} width={scale(row.value)} height={14} rx={7} className={row.className}>
                <title>{`${row.label}: +${row.value}%`}</title>
              </rect>
              <text x={44 + scale(row.value) + 8} y={y + 5} className="benefit-value-label">
                +{row.value}%
              </text>
            </g>
          )
        })}
      </svg>
      <div className="benefit-legend">
        <span className="benefit-legend-item">
          <i className="benefit-swatch benefit-swatch-you" />
          {youLabel}
        </span>
        <span className="benefit-legend-item">
          <i className="benefit-swatch benefit-swatch-them" />
          {themLabel}
        </span>
      </div>
    </div>
  )
}

interface UpliftTrendChartProps {
  youLabel: string
  themLabel: string
  youValue: number
  themValue: number
}

const MONTHS = [0, 1, 2, 3, 4, 5, 6]

/** Ease-out adoption curve: fast initial lift, leveling toward the projected target. */
function projectedAt(target: number, month: number) {
  const t = month / 6
  return target * (1 - (1 - t) ** 2)
}

/** Projected ramp of uplift over the first two quarters for both merchants. */
export function UpliftTrendChart({ youLabel, themLabel, youValue, themValue }: UpliftTrendChartProps) {
  const niceMax = Math.max(20, Math.ceil(Math.max(youValue, themValue) / 5) * 5)
  const width = 280
  const height = 92
  const padLeft = 26
  const padRight = 14
  const padTop = 10
  const padBottom = 22
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const x = (month: number) => padLeft + (month / 6) * plotW
  const y = (value: number) => padTop + plotH - (value / niceMax) * plotH

  const youPoints = MONTHS.map((m) => [x(m), y(projectedAt(youValue, m))] as const)
  const themPoints = MONTHS.map((m) => [x(m), y(projectedAt(themValue, m))] as const)
  const toPath = (pts: readonly (readonly [number, number])[]) => pts.map((p) => p.join(',')).join(' L ')

  const yTicks = [0, niceMax / 2, niceMax]

  return (
    <div className="benefit-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="benefit-trend-svg" role="img" aria-label="Projected uplift over time">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={padLeft} y1={y(t)} x2={width - padRight} y2={y(t)} className="benefit-gridline" />
            <text x={padLeft - 4} y={y(t) + 3} className="benefit-tick-label" textAnchor="end">
              {t}%
            </text>
          </g>
        ))}

        <path d={`M ${toPath(themPoints)}`} className="benefit-line benefit-line-them" />
        <path d={`M ${toPath(youPoints)}`} className="benefit-line benefit-line-you" />

        {[...themPoints, ...youPoints].map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={2.4} className={i < themPoints.length ? 'benefit-dot-them' : 'benefit-dot-you'} />
        ))}
        <circle cx={youPoints[youPoints.length - 1][0]} cy={youPoints[youPoints.length - 1][1]} r={4} className="benefit-dot-you">
          <title>{`${youLabel} at month 6: +${youValue}%`}</title>
        </circle>
        <circle cx={themPoints[themPoints.length - 1][0]} cy={themPoints[themPoints.length - 1][1]} r={4} className="benefit-dot-them">
          <title>{`${themLabel} at month 6: +${themValue}%`}</title>
        </circle>

        <text x={padLeft} y={height - 6} className="benefit-tick-label" textAnchor="start">
          Now
        </text>
        <text x={width - padRight} y={height - 6} className="benefit-tick-label" textAnchor="end">
          Month 6
        </text>
      </svg>
      <div className="benefit-legend">
        <span className="benefit-legend-item">
          <i className="benefit-swatch benefit-swatch-you" />
          {youLabel}
        </span>
        <span className="benefit-legend-item">
          <i className="benefit-swatch benefit-swatch-them" />
          {themLabel}
        </span>
      </div>
    </div>
  )
}
