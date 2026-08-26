// -----------------------------------------------------------------------
// Layout data for the three.js graph visualizations. Positions and colors
// are hand-placed for a stable, legible demo rather than computed from a
// live graph-layout algorithm.
// -----------------------------------------------------------------------

export interface GraphNodeConfig {
  position: [number, number, number]
  /** Hex color (e.g. 0x5980a6). Defaults to the standard edge/node blue. */
  color?: number
  /** Short name rendered as a floating label on the node, e.g. "Basin Coffee". */
  name?: string
}

export interface GraphGapConfig {
  position: [number, number, number]
  color: number
  /** Indexes into the scene's `nodes` array this gap marker dashes a line to. */
  connectedNodeIndexes: number[]
  /** Short label rendered on the gap marker, e.g. "No gift shop". */
  label?: string
}

export interface GraphSceneConfig {
  cameraPosition: [number, number, number]
  nodes: GraphNodeConfig[]
  edges: [number, number][]
  /** Weak/unconfirmed relationships, rendered as dashed lines. */
  dashedEdges?: [number, number][]
  gaps?: GraphGapConfig[]
}

const CLUSTER_TRIANGLE_POSITIONS: [number, number, number][] = [
  [0, 0, 1.3],
  [1.13, 0, -0.65],
  [-1.13, 0, -0.65],
]
const CLUSTER_TRIANGLE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
]

export const DOWNTOWN_LOOP_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 0.7, 3.6],
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x006fcf, name: 'Basin Coffee' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x4fa3e8, name: 'Spinebound' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xa688f0, name: 'Nettle & Bloom' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: [0, 1.1, 0], color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No gift shop' }],
}

export const RIVERSIDE_ROW_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 0.7, 3.6],
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0xe8b54d, name: 'Ridgeline Yoga' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0xd97757, name: 'Loom Bicycle' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xc9a86a, name: 'Anchor & Awl' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: [0, 1.1, 0], color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No wellness' }],
}

export interface IndustryLegendEntry {
  label: string
  colorHex: string
}

export const INDUSTRY_LEGEND: IndustryLegendEntry[] = [
  { label: 'Café — Basin Coffee', colorHex: '#006fcf' },
  { label: 'Bookstore — Spinebound', colorHex: '#4fa3e8' },
  { label: 'Florist — Nettle & Bloom', colorHex: '#a688f0' },
  { label: 'Fitness — Ridgeline Yoga', colorHex: '#e8b54d' },
  { label: 'Bike shop — Loom Bicycle', colorHex: '#d97757' },
  { label: 'Tailor — Anchor & Awl', colorHex: '#c9a86a' },
]

export interface GapLegendEntry {
  label: string
  colorHex: string
}

export const GAP_LEGEND: GapLegendEntry[] = [
  { label: 'Downtown Loop — no gift shop', colorHex: '#c81e2e' },
  { label: 'Riverside Row — no wellness merchant', colorHex: '#c81e2e' },
]

export const FULL_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 1.9, 6.6],
  nodes: [
    { position: [-1.6, 0, 0.9], color: 0x006fcf, name: 'Basin Coffee' },
    { position: [-0.82, 0, -0.45], color: 0x4fa3e8, name: 'Spinebound' },
    { position: [-2.38, 0, -0.45], color: 0xa688f0, name: 'Nettle & Bloom' },
    { position: [1.6, 0, 0.9], color: 0xe8b54d, name: 'Ridgeline Yoga' },
    { position: [2.38, 0, -0.45], color: 0xd97757, name: 'Loom Bicycle' },
    { position: [0.82, 0, -0.45], color: 0xc9a86a, name: 'Anchor & Awl' },
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 0],
    [3, 4],
    [4, 5],
    [5, 3],
  ],
  dashedEdges: [[2, 5]],
  gaps: [
    { position: [-1.6, 1.0, 0], color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No gift shop' },
    { position: [1.6, 1.0, 0], color: 0xc81e2e, connectedNodeIndexes: [3, 4, 5], label: 'No wellness' },
  ],
}
