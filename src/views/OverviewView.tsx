import type { View } from '../App'
import AmexCard3D from '../components/AmexCard3D'
import './OverviewView.css'

interface ProngCard {
  prong: string
  title: string
  description: string
  linkLabel: string
  view: View
}

const PRONG_CARDS: ProngCard[] = [
  {
    prong: 'Prong 1',
    title: 'Live matching',
    description:
      'Real merchants already on Amex, matched with an explainability layer and a value symmetry check.',
    linkLabel: 'Open matching',
    view: 'match',
  },
  {
    prong: 'Prong 3',
    title: 'Gap radar',
    description:
      'Scans the graph for clusters with strong mutual overlap but a missing category, then decides exactly who to recruit.',
    linkLabel: 'Open gap radar',
    view: 'gaps',
  },
  {
    prong: 'Prong 2',
    title: 'Recruit pitch',
    description:
      'For prospects with no transaction history yet: a category level projected preview, honestly labeled as predictive. Generated per prospect from Gap Radar.',
    linkLabel: 'Open gap radar',
    view: 'gaps',
  },
]

interface OverviewViewProps {
  onNavigate: (view: View) => void
}

export default function OverviewView({ onNavigate }: OverviewViewProps) {
  return (
    <main className="overview-main">
      <div className="overview-hero">
        <div className="overview-intro">
          <div className="eyebrow">One engine, three outputs</div>
          <h1>A merchant graph feeds every prong</h1>
          <p>
            Merchants are nodes. Edges are complementary relationships inferred from real
            transaction data: customer overlap, and sequential spend patterns like
            "visits A then B within two weeks." Everything below reads from that one graph.
          </p>
        </div>
        <div className="overview-hero-card">
          <AmexCard3D height={330} rpm={3.6} holder="Connexion Member" />
        </div>
      </div>

      <div className="overview-diagram">
        <div className="overview-diagram-copy">
          <div className="overview-diagram-title">Merchants on Amex, modeled as a graph</div>
          <p>
            Solid edges are measured relationships between real merchants across industries.
            Dashed nodes are structural gaps: categories missing from an otherwise tight
            cluster. That gap is what Prong 3 hunts for.
          </p>
        </div>
        <span className="overview-diagram-link" onClick={() => onNavigate('gaps')}>
          Explore gap radar
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </div>

      <div className="prong-grid">
        {PRONG_CARDS.map((card) => (
          <div className="prong-card" key={card.title}>
            <div className="prong-label">{card.prong}</div>
            <div className="prong-title">{card.title}</div>
            <p className="prong-description">{card.description}</p>
            <span className="prong-link" onClick={() => onNavigate(card.view)}>
              {card.linkLabel}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
