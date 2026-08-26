// -----------------------------------------------------------------------
// Layout data for the three.js graph visualizations. Positions and colors
// are hand-placed for a stable, legible demo rather than computed from a
// live graph-layout algorithm.
// -----------------------------------------------------------------------

export interface GraphNodeConfig {
  position: [number, number, number]
  /** Hex color (e.g. 0x5980a6). Defaults to the standard edge/node blue. */
  color?: number
}

export interface GraphGapConfig {
  position: [number, number, number]
  color: number
  /** Indexes into the scene's `nodes` array this gap marker dashes a line to. */
  connectedNodeIndexes: number[]
}

export interface GraphSceneConfig {
  cameraPosition: [number, number, number]
  nodes: GraphNodeConfig[]
  edges: [number, number][]
  /** Weak/unconfirmed relationships, rendered as dashed lines. */
  dashedEdges?: [number, number][]
  gaps?: GraphGapConfig[]
}

const CLUSTER_TRIANGLE_NODES: GraphNodeConfig[] = [
  { position: [0, 0, 1.3] },
  { position: [1.13, 0, -0.65] },
  { position: [-1.13, 0, -0.65] },
]
const CLUSTER_TRIANGLE_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
]

export const DOWNTOWN_LOOP_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 0.7, 3.6],
  nodes: CLUSTER_TRIANGLE_NODES,
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: [0, 1.1, 0], color: 0x5d5d60, connectedNodeIndexes: [0, 1, 2] }],
}

export const RIVERSIDE_ROW_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 0.7, 3.6],
  nodes: CLUSTER_TRIANGLE_NODES,
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: [0, 1.1, 0], color: 0x7a7a7d, connectedNodeIndexes: [0, 1, 2] }],
}

export interface IndustryLegendEntry {
  label: string
  colorHex: string
}

export const INDUSTRY_LEGEND: IndustryLegendEntry[] = [
  { label: 'Café — Basin Coffee', colorHex: '#1d2d3d' },
  { label: 'Bookstore — Spinebound', colorHex: '#2c455d' },
  { label: 'Florist — Nettle & Bloom', colorHex: '#416180' },
  { label: 'Fitness — Ridgeline Yoga', colorHex: '#597ea3' },
  { label: 'Bike shop — Loom Bicycle', colorHex: '#749dc4' },
  { label: 'Tailor — Anchor & Awl', colorHex: '#94bce3' },
]

export interface GapLegendEntry {
  label: string
  colorHex: string
}

export const GAP_LEGEND: GapLegendEntry[] = [
  { label: 'Downtown Loop — no gift shop', colorHex: '#5d5d60' },
  { label: 'Riverside Row — no wellness merchant', colorHex: '#7a7a7d' },
]

export const FULL_GRAPH: GraphSceneConfig = {
  cameraPosition: [0, 1.9, 6.6],
  nodes: [
    { position: [-1.6, 0, 0.9], color: 0x1d2d3d }, // Café — Basin Coffee
    { position: [-0.82, 0, -0.45], color: 0x2c455d }, // Bookstore — Spinebound
    { position: [-2.38, 0, -0.45], color: 0x416180 }, // Florist — Nettle & Bloom
    { position: [1.6, 0, 0.9], color: 0x597ea3 }, // Fitness — Ridgeline Yoga
    { position: [2.38, 0, -0.45], color: 0x749dc4 }, // Bike shop — Loom Bicycle
    { position: [0.82, 0, -0.45], color: 0x94bce3 }, // Tailor — Anchor & Awl
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
    { position: [-1.6, 1.0, 0], color: 0x5d5d60, connectedNodeIndexes: [0, 1, 2] },
    { position: [1.6, 1.0, 0], color: 0x7a7a7d, connectedNodeIndexes: [3, 4, 5] },
  ],
}
