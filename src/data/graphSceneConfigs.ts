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
  /** Key into GRAPH_ICONS (src/utils/graphIcons.ts), rendered centered on the node. */
  icon?: string
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
  /** Tier-3 structural-relationship edges, rendered with a second parallel gold line. */
  tier3Edges?: [number, number][]
  gaps?: GraphGapConfig[]
  /**
   * Invisible points the camera should still leave room for. The auto-fit camera sizes
   * its zoom from whatever's actually in the scene, so a cluster with a gap marker
   * floating above it needs more room than one that's just the bare triangle — without
   * this, the gap-less clusters zoom in closer and read as a different size. Give them
   * a framing point at the same height the gap marker would occupy, so every cluster
   * frames at the same scale regardless of whether it actually has a gap to show.
   */
  framingPoints?: [number, number, number][]
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
const CLUSTER_CAMERA_POSITION: [number, number, number] = [0, 0.7, 4.1]
const CLUSTER_GAP_POSITION: [number, number, number] = [0, 1.1, 0]

export const DOWNTOWN_LOOP_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x006fcf, name: 'Basin Coffee', icon: 'coffee' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x4fa3e8, name: 'Spinebound', icon: 'book' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xa688f0, name: 'Nettle & Bloom', icon: 'flower' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: CLUSTER_GAP_POSITION, color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No gift shop' }],
}

export const RIVERSIDE_ROW_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0xe8b54d, name: 'Ridgeline Yoga', icon: 'pulse' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0xd97757, name: 'Loom Bicycle', icon: 'bike' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xc9a86a, name: 'Anchor & Awl', icon: 'scissors' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: CLUSTER_GAP_POSITION, color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No wellness' }],
}

// Fully-formed clusters, no structural gap, browsable in the gap radar carousel for contrast
// against the two clusters above that do have an opening.
export const HARBOR_DISTRICT_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x2bb8a3, name: 'Salt & Barrel', icon: 'restaurant' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0xc9962c, name: 'Anchorline Brewing', icon: 'beer' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xb6493f, name: 'Tidewater Butchery', icon: 'knife' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  framingPoints: [CLUSTER_GAP_POSITION],
}

export const MERIDIAN_HEIGHTS_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x6f8fa8, name: 'Cinder & Slate', icon: 'pan' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x8a5a3b, name: 'Loft & Ladder', icon: 'sofa' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xb06bc9, name: 'Halcyon Records', icon: 'vinyl' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  framingPoints: [CLUSTER_GAP_POSITION],
}

export const OLD_MILL_QUARTER_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0xc2703f, name: 'Millhouse Diner', icon: 'restaurant' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x5a8f6f, name: 'Birchwood Apothecary', icon: 'cross' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0x8a7a5a, name: 'Loft Nine Print & Copy', icon: 'printer' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [
    { position: CLUSTER_GAP_POSITION, color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No pet supply store' },
  ],
}

// Fully-formed cluster, no structural gap — same contrast role as Harbor District / Meridian Heights.
export const SABLE_QUAY_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x3a8fa0, name: 'Quay & Anchor Seafood', icon: 'fish' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x9e8a5a, name: 'Driftwood Mercantile', icon: 'cart' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0x5a6f9e, name: 'Lantern Row Books', icon: 'book' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  framingPoints: [CLUSTER_GAP_POSITION],
}

export const FERRY_LANDING_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x6a8caf, name: 'Ferry Landing Dry Cleaners', icon: 'hanger' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0x8a6f4f, name: 'Cobblestone Shoe Repair', icon: 'shoe' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0xb0784a, name: 'Platform Nine News & Coffee', icon: 'newspaper' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [{ position: CLUSTER_GAP_POSITION, color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No bakery' }],
}

export const HOLLOW_CREEK_GRAPH: GraphSceneConfig = {
  cameraPosition: CLUSTER_CAMERA_POSITION,
  nodes: [
    { position: CLUSTER_TRIANGLE_POSITIONS[0], color: 0x7fae7a, name: 'Hollow Creek Nursery School', icon: 'star' },
    { position: CLUSTER_TRIANGLE_POSITIONS[1], color: 0xd97fa0, name: 'Tumble & Blocks Toy Co.', icon: 'blocks' },
    { position: CLUSTER_TRIANGLE_POSITIONS[2], color: 0x6fa3c9, name: 'Creekside Pediatrics', icon: 'heart' },
  ],
  edges: CLUSTER_TRIANGLE_EDGES,
  gaps: [
    { position: CLUSTER_GAP_POSITION, color: 0xc81e2e, connectedNodeIndexes: [0, 1, 2], label: 'No kids bookstore' },
  ],
}

export interface IndustryCluster {
  id: string
  label: string
  graph: GraphSceneConfig
  /** The structural gap this cluster is missing, or null for a fully-formed cluster. */
  gapLabel: string | null
}

/** Every industry cluster the gap radar carousel can page through. */
export const INDUSTRY_CLUSTERS: IndustryCluster[] = [
  { id: 'downtown-loop', label: 'Downtown Loop', graph: DOWNTOWN_LOOP_GRAPH, gapLabel: 'No gift shop' },
  { id: 'riverside-row', label: 'Riverside Row', graph: RIVERSIDE_ROW_GRAPH, gapLabel: 'No wellness merchant' },
  { id: 'old-mill-quarter', label: 'Old Mill Quarter', graph: OLD_MILL_QUARTER_GRAPH, gapLabel: 'No pet supply store' },
  { id: 'ferry-landing', label: 'Ferry Landing', graph: FERRY_LANDING_GRAPH, gapLabel: 'No bakery' },
  { id: 'hollow-creek', label: 'Hollow Creek', graph: HOLLOW_CREEK_GRAPH, gapLabel: 'No kids bookstore' },
  { id: 'harbor-district', label: 'Harbor District', graph: HARBOR_DISTRICT_GRAPH, gapLabel: null },
  { id: 'meridian-heights', label: 'Meridian Heights', graph: MERIDIAN_HEIGHTS_GRAPH, gapLabel: null },
  { id: 'sable-quay', label: 'Sable Quay', graph: SABLE_QUAY_GRAPH, gapLabel: null },
]
