import GraphCanvas from '../components/GraphCanvas'
import { FULL_GRAPH, GAP_LEGEND, INDUSTRY_LEGEND } from '../data/graphSceneConfigs'
import './GraphView.css'

export default function GraphView() {
  return (
    <main className="graph-main">
      <h1>The merchant graph</h1>
      <p className="graph-intro">
        Every merchant on Amex, modeled as one graph spanning industries. Node shade indicates
        category; dashed nodes are structural gaps. Drag to rotate, it also spins on its own.
      </p>

      <div className="graph-canvas-frame">
        <GraphCanvas config={FULL_GRAPH} height={460} />
      </div>

      <div className="graph-legend-grid">
        <div>
          <div className="graph-legend-label">Industries in this graph</div>
          <div className="graph-legend-items">
            {INDUSTRY_LEGEND.map((entry) => (
              <div className="graph-legend-row" key={entry.label}>
                <span className="graph-legend-dot" style={{ background: entry.colorHex }} />
                {entry.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="graph-legend-label">Structural gaps</div>
          <div className="graph-legend-items graph-legend-items-stacked">
            {GAP_LEGEND.map((entry) => (
              <div className="graph-legend-row" key={entry.label}>
                <span className="graph-legend-dash" style={{ borderColor: entry.colorHex }} />
                {entry.label}
              </div>
            ))}
          </div>
          <p className="graph-legend-note">
            The faint bridge between clusters is a weak cross-cluster signal — thin enough that
            Prong 1 won't act on it yet, but the graph keeps it in view.
          </p>
          <p className="graph-legend-note">
            The doubled gold line (Basin ↔ Spinebound) marks a match that has grown past a single
            offer into a Tier 3 structural relationship — see the Matching view for details.
          </p>
        </div>
      </div>
    </main>
  )
}
