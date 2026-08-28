import type { MatchCandidate } from '../data/graphEngineData'
import './MerchantMark.css'

interface MerchantMarkProps {
  candidate: Pick<MatchCandidate, 'mark' | 'name'>
  size?: number
}

/**
 * The merchant's own brand mark.
 *
 * Drawn rather than loaded: these are synthetic businesses, so there is no
 * logo file to fetch, and a monogram in the merchant's own colour reads as a
 * real identity where a grey "LOGO" box reads as an unfinished screen.
 */
export default function MerchantMark({ candidate, size = 52 }: MerchantMarkProps) {
  const { initials, color } = candidate.mark
  return (
    <div
      className="merchant-mark"
      style={{ width: size, height: size, ['--mark' as string]: color }}
      aria-label={`${candidate.name} logo`}
    >
      <svg viewBox="0 0 52 52" width={size} height={size}>
        <defs>
          <linearGradient id={`mark-${initials}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <rect width="52" height="52" rx="13" fill={`url(#mark-${initials})`} />
        <rect
          x="1"
          y="1"
          width="50"
          height="50"
          rx="12.5"
          fill="none"
          stroke="rgba(255,255,255,0.34)"
        />
        <text
          x="26"
          y="27"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          fontSize="19"
          fontWeight="600"
          letterSpacing="0.5"
        >
          {initials}
        </text>
      </svg>
    </div>
  )
}
