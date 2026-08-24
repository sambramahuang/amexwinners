import { useMemo, useState } from 'react'
import GraphView, { type GraphMode, type GhostNode } from './components/GraphView'
import MatchDetailPanel from './components/MatchDetailPanel'
import GapDetailPanel from './components/GapDetailPanel'
import ProspectPanel from './components/ProspectPanel'
import { GAPS } from './data/mockData'
import './App.css'
import './components/Panel.css'

interface Tab {
  id: GraphMode
  label: string
  prong: string
}

const TABS: Tab[] = [
  { id: 'matches', label: 'Merchant Matches', prong: 'Prong 1' },
  { id: 'gaps', label: 'Outreach Gaps', prong: 'Prong 3' },
  { id: 'prospect', label: 'Prospect Preview', prong: 'Prong 2' },
]

const GAP_BY_PROSPECT: Record<string, string> = {
  'prospect-cafe': 'gap-duxton-cafe',
  'prospect-wellness': 'gap-everton-wellness',
}

const LABEL_BY_PROSPECT: Record<string, string> = {
  'prospect-cafe': 'Café',
  'prospect-wellness': 'Wellness / Studio',
  'prospect-grocer': 'Specialty Grocer',
}

export default function App() {
  const [mode, setMode] = useState<GraphMode>('matches')
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)
  const [selectedGapId, setSelectedGapId] = useState<string | null>(null)
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  function changeMode(nextMode: GraphMode) {
    setMode(nextMode)
  }

  const ghost = useMemo<GhostNode | null>(() => {
    if (mode !== 'prospect' || !selectedProspectId) return null
    // Position the ghost node near its linked gap if one exists, otherwise
    // place it at a neutral default spot on the canvas.
    const profileGapId = GAP_BY_PROSPECT[selectedProspectId]
    const gap = profileGapId ? GAPS.find((g) => g.id === profileGapId) : null
    const anchor = gap ? { x: gap.x, y: gap.y } : { x: 50, y: 50 }
    const label = LABEL_BY_PROSPECT[selectedProspectId] ?? selectedProspectId
    return {
      x: anchor.x + 8,
      y: anchor.y - 10,
      anchorX: anchor.x,
      anchorY: anchor.y,
      category: label,
    }
  }, [mode, selectedProspectId])

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Amex AI Hackathon 2026 · Round 1 prototype</span>
          <h1>Circuit</h1>
          <p className="hero-subtitle">
            One merchant graph, built from Amex's closed-loop transaction data,
            powering three growth motions: matching the merchants Amex already
            has, finding the gaps in that network, and pitching the prospects
            who'd fill them.
          </p>
        </div>
        <nav className="tab-nav" aria-label="Prototype view">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${mode === t.id ? 'is-active' : ''}`}
              onClick={() => changeMode(t.id)}
            >
              <span className="tab-prong mono">{t.prong}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="layout">
        <GraphView
          mode={mode}
          selectedId={selectedMerchantId}
          onSelectMerchant={mode === 'matches' ? setSelectedMerchantId : undefined}
          selectedGapId={selectedGapId}
          onSelectGap={setSelectedGapId}
          ghost={ghost}
        />

        {mode === 'matches' && (
          <MatchDetailPanel
            merchantId={selectedMerchantId}
            onSelectMerchant={setSelectedMerchantId}
          />
        )}
        {mode === 'gaps' && <GapDetailPanel gapId={selectedGapId} />}
        {mode === 'prospect' && (
          <ProspectPanel selectedId={selectedProspectId} onSelect={setSelectedProspectId} />
        )}
      </main>

      <footer className="footer">
        <p>
          All merchants, customers, and figures shown are synthetic demo data
          for Round 1. A production build would replace this with real,
          anonymised, aggregated Amex closed-loop transaction data, subject to
          merchant consent and PDPA-compliant aggregation thresholds.
        </p>
      </footer>
    </div>
  )
}
