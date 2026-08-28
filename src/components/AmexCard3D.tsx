import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import './AmexCard3D.css'

// Real card proportions: 85.6mm by 53.98mm.
const CARD_W = 3.4
const CARD_H = CARD_W / 1.586
const CARD_D = 0.038
const CORNER = 0.13

const DEEP = '#0b2a4a'
const BLUE = '#006fcf'
const NIGHT = '#061a2f'

interface AmexCard3DProps {
  /** Height of the canvas. Width always fills the container. */
  height?: number | string
  /** Idle revolutions per minute. */
  rpm?: number
  /** Name printed on the card. */
  holder?: string
  className?: string
}

/** Rounded rectangle as a flat face, with UVs remapped to 0..1 across the face. */
function roundedFace(w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)

  const geo = new THREE.ShapeGeometry(shape, 22)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i += 1) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  }
  uv.needsUpdate = true
  return geo
}

/** Guilloche: the fine interference pattern engraved on financial documents. */
function drawGuilloche(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(120, 190, 255, 0.16)'
  ctx.lineWidth = 1.1
  const cx = w * 0.62
  const cy = h * 0.5
  for (let k = 0; k < 44; k += 1) {
    ctx.beginPath()
    const R = 120 + k * 26
    const r = 46 + k * 3.4
    const d = 22 + k * 1.5
    for (let t = 0; t <= Math.PI * 2 + 0.02; t += 0.02) {
      const x = cx + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)
      const y = cy + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

/** Hexagon lattice, echoing the backdrop used across the Circuit interface. */
function drawHexes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)'
  ctx.lineWidth = 1.6
  const s = 58
  for (let row = 0; row * s * 1.5 < h + s; row += 1) {
    for (let col = 0; col * s * 1.732 < w + s * 2; col += 1) {
      const cx = col * s * 1.732 + (row % 2 ? s * 0.866 : 0)
      const cy = row * s * 1.5
      ctx.beginPath()
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const px = cx + s * 0.52 * Math.cos(a)
        const py = cy + s * 0.52 * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = 12
  const grad = ctx.createLinearGradient(x, y, x + w, y + h)
  grad.addColorStop(0, '#e8cf8f')
  grad.addColorStop(0.42, '#bf9a4a')
  grad.addColorStop(0.62, '#f3e3b0')
  grad.addColorStop(1, '#9c7a33')
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.strokeStyle = 'rgba(70, 50, 12, 0.55)'
  ctx.lineWidth = 2.4
  const cx = x + w / 2
  const cy = y + h / 2
  ctx.beginPath()
  ctx.moveTo(x + 8, cy - h * 0.22); ctx.lineTo(cx - w * 0.16, cy - h * 0.22)
  ctx.moveTo(x + 8, cy + h * 0.22); ctx.lineTo(cx - w * 0.16, cy + h * 0.22)
  ctx.moveTo(x + w - 8, cy - h * 0.22); ctx.lineTo(cx + w * 0.16, cy - h * 0.22)
  ctx.moveTo(x + w - 8, cy + h * 0.22); ctx.lineTo(cx + w * 0.16, cy + h * 0.22)
  ctx.moveTo(cx - w * 0.16, cy - h * 0.34); ctx.lineTo(cx - w * 0.16, cy + h * 0.34)
  ctx.moveTo(cx + w * 0.16, cy - h * 0.34); ctx.lineTo(cx + w * 0.16, cy + h * 0.34)
  ctx.moveTo(cx - w * 0.16, cy); ctx.lineTo(cx + w * 0.16, cy)
  ctx.stroke()
}

function frontTexture(holder: string) {
  const W = 2048
  const H = Math.round(W / 1.586)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, NIGHT)
  g.addColorStop(0.45, DEEP)
  g.addColorStop(0.78, '#0d3f70')
  g.addColorStop(1, '#07223d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  drawHexes(ctx, W, H)
  drawGuilloche(ctx, W, H)

  // Diagonal sheen band.
  const sheen = ctx.createLinearGradient(W * 0.1, 0, W * 0.75, H)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(140, 200, 255, 0.10)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  ctx.font = '700 78px "Space Grotesk", system-ui, sans-serif'
  ctx.fillText('American Express', 96, 150)

  ctx.fillStyle = BLUE
  ctx.fillRect(96, 176, 300, 5)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '500 26px "IBM Plex Mono", ui-monospace, monospace'
  ctx.letterSpacing = '4px'
  ctx.fillText('CIRCUIT / MERCHANT GRAPH', 96, 224)
  ctx.letterSpacing = '0px'

  drawChip(ctx, 96, H * 0.40, 268, 206)

  ctx.font = '500 76px "IBM Plex Mono", ui-monospace, monospace'
  ctx.letterSpacing = '9px'
  const digits = '3782  822463  10005'
  // Underprint plus highlight fakes the relief of embossed digits.
  ctx.fillStyle = 'rgba(3, 14, 26, 0.55)'
  ctx.fillText(digits, 98, H * 0.79 + 3)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.93)'
  ctx.fillText(digits, 96, H * 0.79)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.font = '400 24px "IBM Plex Mono", ui-monospace, monospace'
  ctx.letterSpacing = '3px'
  ctx.fillText('MEMBER SINCE 26', 96, H * 0.895)
  ctx.fillText('VALID THRU 08/31', W * 0.42, H * 0.895)
  ctx.letterSpacing = '0px'

  ctx.font = '600 42px "IBM Plex Sans", system-ui, sans-serif'
  ctx.letterSpacing = '5px'
  ctx.fillStyle = 'rgba(3, 14, 26, 0.5)'
  ctx.fillText(holder.toUpperCase(), 98, H * 0.955 + 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillText(holder.toUpperCase(), 96, H * 0.955)
  ctx.letterSpacing = '0px'

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function backTexture() {
  const W = 2048
  const H = Math.round(W / 1.586)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#06192c')
  g.addColorStop(1, '#0a2d4f')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  drawHexes(ctx, W, H)

  ctx.fillStyle = '#04101d'
  ctx.fillRect(0, H * 0.12, W, H * 0.2)

  ctx.fillStyle = '#e8eef6'
  ctx.fillRect(W * 0.08, H * 0.46, W * 0.62, H * 0.13)
  ctx.fillStyle = 'rgba(11,28,51,0.5)'
  ctx.font = 'italic 44px "IBM Plex Sans", system-ui, sans-serif'
  ctx.fillText('authorised signature', W * 0.1, H * 0.545)

  ctx.fillStyle = '#04101d'
  ctx.fillRect(W * 0.73, H * 0.46, W * 0.12, H * 0.13)
  ctx.fillStyle = '#e8eef6'
  ctx.font = '500 44px "IBM Plex Mono", ui-monospace, monospace'
  ctx.fillText('4021', W * 0.752, H * 0.545)

  ctx.fillStyle = 'rgba(255,255,255,0.34)'
  ctx.font = '400 24px "IBM Plex Sans", system-ui, sans-serif'
  ctx.fillText('Concept prototype. Not a payment instrument.', W * 0.08, H * 0.74)
  ctx.fillText('Synthetic demo asset, AMEX AI Innovation Hackathon 2026.', W * 0.08, H * 0.79)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Soft elliptical contact shadow, so the card reads as floating above a surface. */
function shadowTexture() {
  const S = 512
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(6, 26, 47, 0.55)')
  g.addColorStop(0.45, 'rgba(6, 26, 47, 0.22)')
  g.addColorStop(1, 'rgba(6, 26, 47, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return new THREE.CanvasTexture(c)
}

export default function AmexCard3D({
  height = 520,
  rpm = 4.5,
  holder = 'American Express',
  className = '',
}: AmexCard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Non-nullable alias, so the closures below keep the narrowed type.
    const container: HTMLDivElement = containerRef.current

    let disposed = false
    let raf = 0

    const w = container.clientWidth || 800
    const h = container.clientHeight || 520

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100)
    camera.position.set(0, 0.32, 6.4)
    camera.lookAt(0, 0, 0)

    // Procedural environment: real reflections with no external HDR to load.
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.035)
    scene.environment = envRT.texture

    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    key.position.set(3.2, 4.4, 5.2)
    scene.add(key)

    const rim = new THREE.DirectionalLight(0x8fd0ff, 2.6)
    rim.position.set(-4.6, 1.2, -3.4)
    scene.add(rim)

    const warm = new THREE.DirectionalLight(0xe8b54d, 1.15)
    warm.position.set(2.4, -3.2, -2.2)
    scene.add(warm)

    scene.add(new THREE.AmbientLight(0xbcd4ee, 0.5))

    const card = new THREE.Group()
    scene.add(card)

    const bodyGeo = new RoundedBoxGeometry(CARD_W, CARD_H, CARD_D, 6, CORNER)
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x2f5f8c,
      metalness: 1,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.6,
    })
    card.add(new THREE.Mesh(bodyGeo, bodyMat))

    const faceGeo = roundedFace(CARD_W - 0.012, CARD_H - 0.012, CORNER - 0.006)
    const frontTex = frontTexture(holder)
    const backTex = backTexture()

    const frontMat = new THREE.MeshPhysicalMaterial({
      map: frontTex,
      metalness: 0.45,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.9,
    })
    const front = new THREE.Mesh(faceGeo, frontMat)
    front.position.z = CARD_D / 2 + 0.0012
    card.add(front)

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      metalness: 0.4,
      roughness: 0.3,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.5,
    })
    const back = new THREE.Mesh(faceGeo, backMat)
    back.position.z = -CARD_D / 2 - 0.0012
    back.rotation.y = Math.PI
    card.add(back)

    const shadowTex = shadowTexture()
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W * 1.5, CARD_W * 1.5),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -1.25
    scene.add(shadow)

    // Grab and spin. The card is the one object on the page worth touching,
    // so it takes a real drag: pointer moves rotate it directly, releasing
    // hands it the velocity it had, and the idle spin fades back in once that
    // has bled off.
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    let dragging = false
    let lastPointer = { x: 0, y: 0 }
    let velocity = { x: 0, y: 0 }
    let releaseAt = 0

    function onPointerDown(e: PointerEvent) {
      dragging = true
      releaseAt = 0
      velocity = { x: 0, y: 0 }
      lastPointer = { x: e.clientX, y: e.clientY }
      container.setPointerCapture?.(e.pointerId)
      container.classList.add('is-grabbing')
    }

    function onPointerMove(e: PointerEvent) {
      if (dragging) {
        const dx = e.clientX - lastPointer.x
        const dy = e.clientY - lastPointer.y
        lastPointer = { x: e.clientX, y: e.clientY }
        // 0.0095 rad per pixel keeps a full turn at roughly two thirds of a
        // typical drag across the canvas.
        const spinY = dx * 0.0095
        const spinX = dy * 0.0065
        card.rotation.y += spinY
        dragRotationX += spinX
        velocity = { x: spinX, y: spinY }
        return
      }
      const rect = container.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    function endDrag(e?: PointerEvent) {
      if (!dragging) return
      dragging = false
      releaseAt = clock.getElapsedTime()
      if (e) container.releasePointerCapture?.(e.pointerId)
      container.classList.remove('is-grabbing')
    }

    function onPointerLeave() {
      target.x = 0
      target.y = 0
    }

    // Tilting past vertical reads as a glitch rather than a spin, so the drag
    // is clamped short of it and springs back toward level.
    let dragRotationX = 0
    const MAX_TILT = 0.7

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', endDrag)
    container.addEventListener('pointercancel', endDrag)
    container.addEventListener('pointerleave', onPointerLeave)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const spin = (rpm / 60) * Math.PI * 2
    const clock = new THREE.Clock()

    function animate() {
      if (disposed) return
      const dt = clock.getDelta()
      const t = clock.getElapsedTime()

      if (dragging) {
        // Nothing else moves the card while a hand is on it.
      } else {
        // Inertia from the throw, decaying, then the idle spin fades back in.
        const sinceRelease = releaseAt ? t - releaseAt : Infinity
        const decay = Math.exp(-sinceRelease * 2.6)
        card.rotation.y += velocity.y * decay * 60 * dt
        dragRotationX += velocity.x * decay * 60 * dt

        const idleWeight = reduceMotion ? 0 : Math.min(1, sinceRelease / 1.4)
        card.rotation.y += spin * dt * idleWeight
      }

      dragRotationX = Math.max(-MAX_TILT, Math.min(MAX_TILT, dragRotationX))
      if (!dragging) dragRotationX *= 1 - Math.min(1, dt * 1.6)

      eased.x += (target.x - eased.x) * Math.min(1, dt * 4)
      eased.y += (target.y - eased.y) * Math.min(1, dt * 4)

      const idleFloat = reduceMotion ? 0 : Math.sin(t * 0.55) * 0.06
      card.rotation.x = dragRotationX + idleFloat + eased.y * -0.22
      card.rotation.z = Math.sin(t * 0.37) * 0.028 + eased.x * 0.06
      card.position.y = reduceMotion ? 0 : Math.sin(t * 0.75) * 0.055
      shadow.material.opacity = 0.85 - Math.abs(Math.sin(card.rotation.y)) * 0.25

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      const nw = container.clientWidth || w
      const nh = container.clientHeight || h
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', handleResize)

    // Webfonts land after first paint; redraw the face once they are ready so
    // the card is not baked with fallback type.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (cancelled || disposed) return
      frontMat.map = frontTexture(holder)
      frontMat.needsUpdate = true
      frontTex.dispose()
    })

    return () => {
      disposed = true
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', endDrag)
      container.removeEventListener('pointercancel', endDrag)
      container.removeEventListener('pointerleave', onPointerLeave)
      bodyGeo.dispose()
      faceGeo.dispose()
      bodyMat.dispose()
      frontMat.dispose()
      backMat.dispose()
      frontTex.dispose()
      backTex.dispose()
      shadowTex.dispose()
      envRT.texture.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.parentNode?.removeChild(renderer.domElement)
    }
  }, [holder, rpm])

  return <div ref={containerRef} className={`amex-card-3d ${className}`} style={{ height }} />
}
