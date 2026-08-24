import { useMemo } from 'react'
import { MERCHANTS, MATCHES, GAPS, CLUSTERS, type Match } from '../data/mockData'
import './GraphView.css'

const posById = Object.fromEntries(MERCHANTS.map((m) => [m.id, m]))

export type GraphMode = 'matches' | 'gaps' | 'prospect'

export interface GhostNode {
  x: number
  y: number
  anchorX: number
  anchorY: number
  category: string
}

interface GraphViewProps {
  mode: GraphMode
  selectedId: string | null
  onSelectMerchant?: (id: string) => void
  selectedGapId: string | null
  onSelectGap: (id: string) => void
  ghost?: GhostNode | null
}

function edgeStyle(match: Match) {
  // Stronger, more balanced pairs render brighter and thicker.
  const strength = (match.sequencePct / 40) * 0.6 + (match.symmetryScore / 100) * 0.4
  const width = 1 + strength * 3.2
  const opacity = 0.25 + strength * 0.6
  const color = match.symmetryScore >= 70 ? 'var(--accent-cyan)' : 'var(--text-tertiary)'
  return { width, opacity, color }
}

export default function GraphView({
  mode,
  selectedId,
  onSelectMerchant,
  selectedGapId,
  onSelectGap,
  ghost,
}: GraphViewProps) {
  const clusters = Object.values(CLUSTERS)

  const highlightedMatchIds = useMemo(() => {
    if (!selectedId) return new Set()
    return new Set(
      MATCHES.filter((m) => m.a === selectedId || m.b === selectedId).map((m) => m.id)
    )
  }, [selectedId])

  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set()
    const ids = new Set([selectedId])
    MATCHES.forEach((m) => {
      if (m.a === selectedId) ids.add(m.b)
      if (m.b === selectedId) ids.add(m.a)
    })
    return ids
  }, [selectedId])

  return (
    <div className="graph-shell">
      <svg viewBox="0 0 100 100" className="graph-svg" preserveAspectRatio="xMidYMid meet">
        {/* Cluster labels */}
        {clusters.map((c) => (
          <text key={c.id} x={c.cx} y={8} textAnchor="middle" className="cluster-label">
            {c.label.toUpperCase()}
          </text>
        ))}

        {/* Edges — always visible as context, dimmed further when a gap
            view wants the markers to carry the focus */}
        {MATCHES.map((m) => {
          const a = posById[m.a]
          const b = posById[m.b]
          const style = edgeStyle(m)
          const selectionDimmed = selectedId && !highlightedMatchIds.has(m.id)
          const gapModeDimmed = mode === 'gaps' || mode === 'prospect'
          const opacity = style.opacity * (selectionDimmed ? 0.25 : 1) * (gapModeDimmed ? 0.45 : 1)
          return (
            <line
              key={m.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={style.color}
              strokeWidth={style.width * 0.35}
              strokeOpacity={opacity}
              className="graph-edge"
            />
          )
        })}

        {/* Gap markers */}
        {mode === 'gaps' &&
          GAPS.map((g) => (
            <g
              key={g.id}
              className={`gap-marker ${selectedGapId === g.id ? 'is-selected' : ''}`}
              onClick={() => onSelectGap(g.id)}
              tabIndex={0}
              role="button"
              aria-label={`Gap: missing ${g.missingCategory} in ${CLUSTERS[g.cluster].label}`}
              onKeyDown={(e) => e.key === 'Enter' && onSelectGap(g.id)}
            >
              <circle cx={g.x} cy={g.y} r={4.4} className="gap-ring" />
              <circle cx={g.x} cy={g.y} r={2.1} className="gap-core" />
              <text x={g.x} y={g.y + 8.5} textAnchor="middle" className="gap-label">
                {g.missingCategory}
              </text>
            </g>
          ))}

        {/* Ghost prospect node (prong 2) */}
        {mode === 'prospect' && ghost && (
          <g className="ghost-node">
            <line
              x1={ghost.x} y1={ghost.y}
              x2={ghost.anchorX} y2={ghost.anchorY}
              className="ghost-edge"
            />
            <circle cx={ghost.x} cy={ghost.y} r={3.6} className="ghost-circle" />
            <text x={ghost.x} y={ghost.y + 7.5} textAnchor="middle" className="ghost-label">
              {ghost.category}
            </text>
            <text x={ghost.x} y={ghost.y - 6} textAnchor="middle" className="ghost-tag">
              not yet on amex
            </text>
          </g>
        )}

        {/* Merchant nodes */}
        {MERCHANTS.map((m) => {
          const isSelected = selectedId === m.id
          const isDimmed = mode === 'matches' && selectedId && !connectedIds.has(m.id)
          return (
            <g
              key={m.id}
              className={`merchant-node ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectMerchant?.(m.id)}
              tabIndex={onSelectMerchant ? 0 : -1}
              role={onSelectMerchant ? 'button' : undefined}
              aria-label={`${m.name}, ${m.category}`}
              onKeyDown={(e) => e.key === 'Enter' && onSelectMerchant?.(m.id)}
              style={{ opacity: isDimmed ? 0.35 : 1 }}
            >
              <circle cx={m.x} cy={m.y} r={2.6} className="node-circle" />
              <text x={m.x} y={m.y - 4.2} textAnchor="middle" className="node-name">
                {m.name}
              </text>
              <text x={m.x} y={m.y + 6.4} textAnchor="middle" className="node-category">
                {m.category}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
