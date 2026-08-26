import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { GraphSceneConfig } from '../data/graphSceneConfigs'
import './GraphCanvas.css'

const DEFAULT_NODE_COLOR = 0x006fcf
const EDGE_COLOR = 0x006fcf
const DASHED_EDGE_COLOR = 0x5b6b82
const TIER3_EDGE_COLOR = 0xe8b54d
const TIER3_OFFSET = 0.045

interface GraphCanvasProps {
  config: GraphSceneConfig
  height?: number | string
}

/** A small, self-rotating three.js node-link graph. Drag to rotate manually. */
export default function GraphCanvas({ config, height = 190 }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let raf = 0

    const width = container.clientWidth || 300
    const startHeight = container.clientHeight || 190

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, startHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(width, startHeight)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.left = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    // three.js sets overflow: hidden on this element internally, which clips any node
    // label whose anchor lands near the canvas edge — override it so labels can spill
    // into the (visible-overflow) card padding instead of getting cut off.
    labelRenderer.domElement.style.overflow = 'visible'
    container.appendChild(labelRenderer.domElement)

    const scene = new THREE.Scene()
    // Orthographic, not perspective: with rotation around the target, a perspective camera
    // lets nodes swing close to the lens as the graph turns, blowing their projected
    // size/position up ("shooting out" of the frame). Orthographic projection has no
    // near/far size falloff, so rotation stays uniform regardless of angle.
    let currentAspect = width / startHeight
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.position.set(...config.cameraPosition)

    // Rotation is unrestricted, so a single fixed zoom can't work: whatever's sized to
    // look good face-on will overflow once rotation puts the graph's long axis on the
    // screen's short one, and whatever's sized to survive every angle looks sparse and
    // lets labels crowd each other face-on. Instead, refit the frustum every frame to
    // whatever's actually facing the camera right now — always tight, never clipped.
    const anchors = [
      ...config.nodes.map(({ position: [x, y, z] }) => new THREE.Vector3(x, y + 0.24, z)),
      ...(config.gaps ?? []).map(({ position: [x, y, z] }) => new THREE.Vector3(x, y + 0.22, z)),
    ]
    // Labels are fixed-pixel-size DOM boxes anchored to that point, so they still extend
    // a bit past it on screen no matter how tightly the anchors themselves are framed.
    const LABEL_MARGIN = 1.18
    const viewMatrix = new THREE.Matrix4()
    const viewSpacePoint = new THREE.Vector3()

    function fitCameraToAnchors() {
      camera.updateMatrixWorld(true)
      viewMatrix.copy(camera.matrixWorld).invert()
      let maxAbsX = 0.001
      let maxAbsY = 0.001
      for (const anchor of anchors) {
        viewSpacePoint.copy(anchor).applyMatrix4(viewMatrix)
        maxAbsX = Math.max(maxAbsX, Math.abs(viewSpacePoint.x))
        maxAbsY = Math.max(maxAbsY, Math.abs(viewSpacePoint.y))
      }
      const halfHeight = Math.max(maxAbsY, maxAbsX / currentAspect) * LABEL_MARGIN
      camera.left = -halfHeight * currentAspect
      camera.right = halfHeight * currentAspect
      camera.top = halfHeight
      camera.bottom = -halfHeight
      camera.updateProjectionMatrix()
    }
    fitCameraToAnchors()

    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material }[] = []

    const nodeGeometry = new THREE.SphereGeometry(0.14, 24, 24)
    disposables.push({ geometry: nodeGeometry })
    for (const node of config.nodes) {
      const material = new THREE.MeshBasicMaterial({
        color: node.color ?? DEFAULT_NODE_COLOR,
      })
      disposables.push({ material })
      const mesh = new THREE.Mesh(nodeGeometry, material)
      mesh.position.set(...node.position)
      scene.add(mesh)

      if (node.name) {
        const el = document.createElement('div')
        el.className = 'graph-node-label'
        el.textContent = node.name
        const label = new CSS2DObject(el)
        label.position.set(node.position[0], node.position[1] + 0.24, node.position[2])
        scene.add(label)
      }
    }

    const edgeMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR })
    disposables.push({ material: edgeMaterial })
    for (const [a, b] of config.edges) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...config.nodes[a].position),
        new THREE.Vector3(...config.nodes[b].position),
      ])
      disposables.push({ geometry })
      scene.add(new THREE.Line(geometry, edgeMaterial))
    }

    if (config.dashedEdges) {
      const dashedEdgeMaterial = new THREE.LineDashedMaterial({
        color: DASHED_EDGE_COLOR,
        dashSize: 0.06,
        gapSize: 0.05,
      })
      disposables.push({ material: dashedEdgeMaterial })
      for (const [a, b] of config.dashedEdges) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...config.nodes[a].position),
          new THREE.Vector3(...config.nodes[b].position),
        ])
        disposables.push({ geometry })
        const line = new THREE.Line(geometry, dashedEdgeMaterial)
        line.computeLineDistances()
        scene.add(line)
      }
    }

    if (config.tier3Edges) {
      const tier3Material = new THREE.LineBasicMaterial({ color: TIER3_EDGE_COLOR })
      disposables.push({ material: tier3Material })
      for (const [a, b] of config.tier3Edges) {
        const pointA = new THREE.Vector3(...config.nodes[a].position)
        const pointB = new THREE.Vector3(...config.nodes[b].position)
        const direction = pointB.clone().sub(pointA).normalize()
        const offset = direction.clone().cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(TIER3_OFFSET)
        const geometry = new THREE.BufferGeometry().setFromPoints([pointA.clone().add(offset), pointB.clone().add(offset)])
        disposables.push({ geometry })
        scene.add(new THREE.Line(geometry, tier3Material))
      }
    }

    if (config.gaps) {
      const gapBoxGeometry = new THREE.BoxGeometry(0.22, 0.22, 0.22)
      disposables.push({ geometry: gapBoxGeometry })
      for (const gap of config.gaps) {
        const gapMaterial = new THREE.MeshBasicMaterial({ color: gap.color, wireframe: true })
        disposables.push({ material: gapMaterial })
        const gapMesh = new THREE.Mesh(gapBoxGeometry, gapMaterial)
        gapMesh.position.set(...gap.position)
        scene.add(gapMesh)

        if (gap.label) {
          const el = document.createElement('div')
          el.className = 'graph-gap-label'
          el.textContent = gap.label
          const label = new CSS2DObject(el)
          label.position.set(gap.position[0], gap.position[1] + 0.22, gap.position[2])
          scene.add(label)
        }

        const dashMaterial = new THREE.LineDashedMaterial({ color: gap.color, dashSize: 0.08, gapSize: 0.06 })
        disposables.push({ material: dashMaterial })
        for (const idx of gap.connectedNodeIndexes) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...config.nodes[idx].position),
            new THREE.Vector3(...gap.position),
          ])
          disposables.push({ geometry })
          const line = new THREE.Line(geometry, dashMaterial)
          line.computeLineDistances()
          scene.add(line)
        }
      }
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6

    function animate() {
      if (disposed) return
      controls.update()
      fitCameraToAnchors()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      if (!container) return
      const w = container.clientWidth || width
      const h = container.clientHeight || startHeight
      currentAspect = w / h
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      for (const d of disposables) {
        d.geometry?.dispose()
        d.material?.dispose()
      }
      renderer.dispose()
      renderer.domElement.parentNode?.removeChild(renderer.domElement)
      labelRenderer.domElement.parentNode?.removeChild(labelRenderer.domElement)
    }
  }, [config])

  return <div ref={containerRef} className="graph-canvas" style={{ height }} />
}
