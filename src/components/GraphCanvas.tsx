import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { GraphSceneConfig } from '../data/graphSceneConfigs'
import './GraphCanvas.css'

const DEFAULT_NODE_COLOR = 0x006fcf
const EDGE_COLOR = 0x006fcf
const DASHED_EDGE_COLOR = 0x5b6b82

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
    container.appendChild(labelRenderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / startHeight, 0.1, 100)
    camera.position.set(...config.cameraPosition)

    scene.add(new THREE.AmbientLight(0xffffff, 0.75))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
    directionalLight.position.set(3, 4, 2)
    scene.add(directionalLight)

    const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material }[] = []

    const nodeGeometry = new THREE.SphereGeometry(0.14, 24, 24)
    disposables.push({ geometry: nodeGeometry })
    for (const node of config.nodes) {
      const material = new THREE.MeshStandardMaterial({
        color: node.color ?? DEFAULT_NODE_COLOR,
        roughness: 0.5,
        metalness: 0.1,
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
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function handleResize() {
      if (!container) return
      const w = container.clientWidth || width
      const h = container.clientHeight || startHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
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
