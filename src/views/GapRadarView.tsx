import type { View } from '../App'
import GraphCanvas from '../components/GraphCanvas'
import { DOWNTOWN_LOOP_GRAPH, RIVERSIDE_ROW_GRAPH, type GraphSceneConfig } from '../data/graphSceneConfigs'
import { PROSPECT_TARGETS } from '../data/graphEngineData'
import './GapRadarView.css'

interface ClusterGraphCardProps {
  title: string
  config: GraphSceneConfig
  merchantNames: [string, string, string]
  gapLabel: string
}

function ClusterGraphCard({ title, config, merchantNames, gapLabel }: ClusterGraphCardProps) {
  return (
    <div className="cluster-diagram-card">
      <div className="cluster-diagram-title">{title}</div>
      <GraphCanvas config={config} height={190} />
      <div className="cluster-diagram-names">
        {merchantNames.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
      <div className="cluster-diagram-caption">{gapLabel} · drag to rotate</div>
    </div>
  )
}

interface GapRadarViewProps {
  onGeneratePitch: (prospectIdx: number, view: View) => void
}

export default function GapRadarView({ onGeneratePitch }: GapRadarViewProps) {
  return (
    <main className="gaps-main">
      <h1>Gap radar</h1>
      <p className="gaps-intro">
        Scans the graph for clusters with strong mutual overlap but a missing category, and decides
        exactly who to target and why.
      </p>

      <div className="cluster-diagram-grid">
        <ClusterGraphCard
          title="Downtown Loop cluster"
          config={DOWNTOWN_LOOP_GRAPH}
          merchantNames={['Basin Coffee', 'Spinebound Books', 'Nettle & Bloom']}
          gapLabel="gift shop — gap"
        />
        <ClusterGraphCard
          title="Riverside Row cluster"
          config={RIVERSIDE_ROW_GRAPH}
          merchantNames={['Ridgeline Yoga', 'Loom Bicycle Co.', 'Anchor & Awl']}
          gapLabel="wellness — gap"
        />
      </div>

      <div className="gaps-table-label">Recruit targets, ranked by gap fit</div>
      <div className="gaps-table-wrap">
        <table className="gaps-table">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Cluster</th>
              <th>Why this gap</th>
              <th>Waiting</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {PROSPECT_TARGETS.map((p, i) => (
              <tr key={p.id}>
                <td>
                  <div className="gaps-table-name">{p.name}</div>
                  <div className="gaps-table-category">{p.category}</div>
                </td>
                <td>{p.cluster}</td>
                <td className="gaps-table-reasoning">{p.reasoning}</td>
                <td>{p.waiting.length} merchants</td>
                <td className="gaps-table-action">
                  <button className="gaps-generate-btn" onClick={() => onGeneratePitch(i, 'pitch')}>
                    Generate pitch →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
