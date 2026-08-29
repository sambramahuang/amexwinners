import { useEffect, useRef } from 'react'
import './EngravedBackdrop.css'

/**
 * Engraved guilloche backdrop.
 *
 * The look financial documents have had since banknote engraving: fine
 * intaglio linework, radiating globes, wave ribbons. Drawn procedurally into a
 * repeating tile rather than shipped as an image, so it costs nothing to load
 * and can be recoloured from the theme.
 *
 * This is an original pattern in that tradition. It is not a reproduction of
 * any bank's security artwork, and the banner carries this product's name.
 */
const TILE = 460
const INK = '#9c6b1f'

function drawGlobe(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  // Meridians: ellipses narrowing toward the poles, the way an engraved globe
  // is built up rather than shaded.
  for (let i = 1; i < 7; i += 1) {
    const w = r * Math.cos((i / 7) * (Math.PI / 2))
    ctx.beginPath()
    ctx.ellipse(0, 0, w, r, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (const t of [-0.55, 0, 0.55]) {
    ctx.beginPath()
    ctx.ellipse(0, r * t, r * Math.cos(Math.asin(t)), r * 0.14, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}

function drawSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, turns: number) {
  ctx.beginPath()
  for (let a = 0; a <= Math.PI * 2 * turns; a += 0.08) {
    const rad = (a / (Math.PI * 2 * turns)) * r
    const x = cx + Math.cos(a) * rad
    const y = cy + Math.sin(a) * rad
    if (a === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

/** A ribbon banner with the product name set across it. */
function drawBanner(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, label: string) {
  const h = 26
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy - h / 2)
  ctx.quadraticCurveTo(cx, cy - h / 2 - 7, cx + w / 2, cy - h / 2)
  ctx.lineTo(cx + w / 2, cy + h / 2)
  ctx.quadraticCurveTo(cx, cy + h / 2 + 7, cx - w / 2, cy + h / 2)
  ctx.closePath()
  ctx.stroke()

  ctx.save()
  ctx.font = '600 13px Futura, Jost, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '2px'
  ctx.fillStyle = INK
  ctx.fillText(label, cx, cy + 1)
  ctx.restore()
}

/** Long horizontal wave, drawn as a bundle of parallel lines. */
function drawWave(ctx: CanvasRenderingContext2D, y: number, amp: number, lines: number) {
  for (let i = 0; i < lines; i += 1) {
    ctx.beginPath()
    for (let x = -20; x <= TILE + 20; x += 4) {
      const yy = y + i * 3 + Math.sin((x / TILE) * Math.PI * 2) * amp
      if (x === -20) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
}

function buildTile(label: string): string {
  const c = document.createElement('canvas')
  c.width = TILE
  c.height = TILE
  const ctx = c.getContext('2d')
  if (!ctx) return ''

  ctx.strokeStyle = INK
  ctx.lineWidth = 0.7

  drawWave(ctx, 96, 13, 4)
  drawWave(ctx, 326, 13, 4)

  drawGlobe(ctx, TILE * 0.5, TILE * 0.28, 46)
  drawGlobe(ctx, 0, TILE * 0.78, 46)
  drawGlobe(ctx, TILE, TILE * 0.78, 46)

  drawBanner(ctx, TILE * 0.5, TILE * 0.44, 176, label)
  drawBanner(ctx, 0, TILE * 0.94, 176, label)
  drawBanner(ctx, TILE, TILE * 0.94, 176, label)

  ctx.lineWidth = 0.55
  drawSpiral(ctx, TILE * 0.16, TILE * 0.14, 30, 3)
  drawSpiral(ctx, TILE * 0.84, TILE * 0.14, 30, 3)
  drawSpiral(ctx, TILE * 0.16, TILE * 0.64, 30, 3)
  drawSpiral(ctx, TILE * 0.84, TILE * 0.64, 30, 3)

  return c.toDataURL('image/png')
}

export default function EngravedBackdrop({ label = 'CONNEXION' }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Webfonts land after first paint, so the banner is drawn once they are
    // ready or it bakes in a fallback face.
    let cancelled = false
    const paint = () => {
      if (cancelled || !el) return
      const url = buildTile(label)
      if (url) el.style.backgroundImage = `url(${url})`
    }
    paint()
    document.fonts?.ready.then(paint)
    return () => {
      cancelled = true
    }
  }, [label])

  return <div ref={ref} className="engraved-backdrop" aria-hidden="true" />
}
