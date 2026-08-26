import { lazy, Suspense, useEffect, useState } from 'react'
import Nav from './components/Nav'
import OverviewView from './views/OverviewView'
import MatchingView from './views/MatchingView'
import RecruitPitchView from './views/RecruitPitchView'
import './App.css'

// The 3D graph views pull in three.js — code-split them so it's only
// downloaded when a visitor actually opens Graph or Gap Radar.
const GraphView = lazy(() => import('./views/GraphView'))
const GapRadarView = lazy(() => import('./views/GapRadarView'))

export type View = 'overview' | 'graph' | 'match' | 'gaps' | 'pitch'

const VIEWS: View[] = ['overview', 'graph', 'match', 'gaps', 'pitch']

function readViewFromHash(): View {
  const hash = window.location.hash.slice(1)
  return (VIEWS as string[]).includes(hash) ? (hash as View) : 'overview'
}

export default function App() {
  const [view, setViewState] = useState<View>(() => readViewFromHash())
  const [selectedProspectIdx, setSelectedProspectIdx] = useState(0)

  function setView(nextView: View) {
    setViewState(nextView)
    if (window.location.hash.slice(1) !== nextView) {
      window.location.hash = nextView
    }
  }

  useEffect(() => {
    function onHashChange() {
      setViewState(readViewFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function generatePitch(prospectIdx: number, nextView: View) {
    setSelectedProspectIdx(prospectIdx)
    setView(nextView)
  }

  return (
    <div className="app-shell">
      <Nav view={view} onChange={setView} />

      {view === 'overview' && <OverviewView onNavigate={setView} />}
      {view === 'graph' && (
        <Suspense fallback={null}>
          <GraphView />
        </Suspense>
      )}
      {view === 'match' && <MatchingView />}
      {view === 'gaps' && (
        <Suspense fallback={null}>
          <GapRadarView onGeneratePitch={generatePitch} />
        </Suspense>
      )}
      {view === 'pitch' && (
        <RecruitPitchView selectedIdx={selectedProspectIdx} onSelect={setSelectedProspectIdx} />
      )}

      <footer className="app-footer">
        Synthetic demo data — all merchants, customers, scores, and uplift figures are invented
        to illustrate the system's reasoning, not real Amex data.
      </footer>
    </div>
  )
}
