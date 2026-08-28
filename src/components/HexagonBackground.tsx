import { useCallback, useEffect, useRef, useState, type ComponentProps, type CSSProperties } from 'react'
import './HexagonBackground.css'

interface HexagonBackgroundProps extends ComponentProps<'div'> {
  /** Must be greater than 50. */
  hexagonSize?: number
  hexagonMargin?: number
  /** How many hexagon-widths out the glow spreads from the cursor. */
  glowRadius?: number
}

export default function HexagonBackground({
  className,
  children,
  hexagonSize = 75,
  hexagonMargin = 3,
  glowRadius = 3.2,
  style,
  ...props
}: HexagonBackgroundProps) {
  const hexagonWidth = hexagonSize
  const hexagonHeight = hexagonSize * 1.1
  const rowSpacing = hexagonSize * 0.8
  const baseMarginTop = -36 - 0.275 * (hexagonSize - 100)
  const computedMarginTop = baseMarginTop + hexagonMargin
  const oddRowMarginLeft = -(hexagonSize / 2)
  const evenRowMarginLeft = hexagonMargin / 2

  const [gridDimensions, setGridDimensions] = useState({ rows: 0, columns: 0 })

  const updateGridDimensions = useCallback(() => {
    const rows = Math.ceil(window.innerHeight / rowSpacing)
    const columns = Math.ceil(window.innerWidth / hexagonWidth) + 1
    setGridDimensions({ rows, columns })
  }, [rowSpacing, hexagonWidth])

  useEffect(() => {
    updateGridDimensions()
    window.addEventListener('resize', updateGridDimensions)
    return () => window.removeEventListener('resize', updateGridDimensions)
  }, [updateGridDimensions])

  // Radiating glow: every cell within `glowRadius` hexagon-widths of the
  // cursor gets a soft, distance-faded highlight, instead of only the single
  // cell directly under the pointer.
  const containerRef = useRef<HTMLDivElement>(null)
  const cellCentersRef = useRef<{ el: HTMLDivElement; cx: number; cy: number }[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cells = container.querySelectorAll<HTMLDivElement>('.hexagon-cell')
    cellCentersRef.current = Array.from(cells).map((el) => {
      const rect = el.getBoundingClientRect()
      return { el, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
    })
  }, [gridDimensions, hexagonSize, hexagonMargin])

  useEffect(() => {
    const radiusPx = hexagonSize * glowRadius
    let raf = 0
    let pendingPoint: { x: number; y: number } | null = null

    function applyGlow(x: number, y: number) {
      for (const { el, cx, cy } of cellCentersRef.current) {
        const dist = Math.hypot(cx - x, cy - y)
        const t = Math.max(0, 1 - dist / radiusPx)
        // Smoothstep easing for a soft, rounded falloff.
        const eased = t * t * (3 - 2 * t)
        el.style.setProperty('--glow', eased.toFixed(3))
      }
    }

    // Listens on window rather than the hexagon layer itself: pointermove
    // bubbles to window no matter what element it actually landed on (a
    // card, a button, plain text), so the glow reads the cursor position
    // everywhere on the page without needing any pointer-events overrides
    // on the app's content, and without any risk of blocking clicks.
    function onMove(e: PointerEvent) {
      pendingPoint = { x: e.clientX, y: e.clientY }
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          if (pendingPoint) applyGlow(pendingPoint.x, pendingPoint.y)
        })
      }
    }

    function onLeave() {
      for (const { el } of cellCentersRef.current) {
        el.style.setProperty('--glow', '0')
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [hexagonSize, glowRadius])

  return (
    <div
      ref={containerRef}
      data-slot="hexagon-background"
      className={['hexagon-background', className].filter(Boolean).join(' ')}
      style={{ ...style, ['--hexagon-margin' as string]: `${hexagonMargin}px` } as CSSProperties}
      {...props}
    >
      <div className="hexagon-grid">
        {Array.from({ length: gridDimensions.rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="hexagon-row"
            style={{
              marginTop: computedMarginTop,
              marginLeft: ((rowIndex + 1) % 2 === 0 ? evenRowMarginLeft : oddRowMarginLeft) - 10,
            }}
          >
            {Array.from({ length: gridDimensions.columns }).map((_, colIndex) => (
              <div
                key={`hexagon-${rowIndex}-${colIndex}`}
                className="hexagon-cell"
                style={{ width: hexagonWidth, height: hexagonHeight, marginLeft: hexagonMargin }}
              />
            ))}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
