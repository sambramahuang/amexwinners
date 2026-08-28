// -----------------------------------------------------------------------
// The interaction layer.
//
// Every control on the page is a physical surface: it tilts toward the
// pointer, catches a specular highlight where the pointer is, and sinks when
// pressed. One delegated listener drives all of it through CSS custom
// properties, so nothing needs a wrapper component and adding a new button
// anywhere gets the behaviour for free.
// -----------------------------------------------------------------------

const TILT_SELECTOR = [
  '.btn',
  '.filter-pill',
  '.swipe-btn',
  '.role-card',
  '.prong-card',
  '.status-chip.is-off',
  '.pitch-selector-item',
  '.nav-link',
].join(', ')

const PRESSED = 'is-pressed-3d'
const ACTIVE = 'is-tilting'

let current: HTMLElement | null = null

function clear(el: HTMLElement | null) {
  if (!el) return
  el.classList.remove(ACTIVE, PRESSED)
  el.style.removeProperty('--tx')
  el.style.removeProperty('--ty')
  el.style.removeProperty('--px')
  el.style.removeProperty('--py')
}

function onPointerMove(e: PointerEvent) {
  const target = (e.target as Element | null)?.closest?.(TILT_SELECTOR) as HTMLElement | null

  if (target !== current) {
    clear(current)
    current = target
    if (target) target.classList.add(ACTIVE)
  }
  if (!target) return

  const rect = target.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  // -1 to 1 across the control, which the transform turns into degrees.
  const nx = (e.clientX - rect.left) / rect.width
  const ny = (e.clientY - rect.top) / rect.height
  target.style.setProperty('--tx', (nx * 2 - 1).toFixed(3))
  target.style.setProperty('--ty', (ny * 2 - 1).toFixed(3))
  target.style.setProperty('--px', `${(nx * 100).toFixed(1)}%`)
  target.style.setProperty('--py', `${(ny * 100).toFixed(1)}%`)
}

function onPointerDown(e: PointerEvent) {
  const target = (e.target as Element | null)?.closest?.(TILT_SELECTOR) as HTMLElement | null
  if (target) target.classList.add(PRESSED)
}

function releasePress() {
  document.querySelectorAll<HTMLElement>(`.${PRESSED}`).forEach((el) => {
    el.classList.remove(PRESSED)
  })
}

/** Call once at startup. Does nothing when the visitor prefers reduced motion. */
export function initInteraction3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  document.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.addEventListener('pointerup', releasePress, { passive: true })
  document.addEventListener('pointercancel', releasePress, { passive: true })
  document.addEventListener('pointerleave', () => clear(current), { passive: true })
  // A scroll can move a control out from under a stationary pointer.
  document.addEventListener('scroll', () => clear(current), { passive: true, capture: true })
}
