import { lazy, Suspense, useEffect, useState } from 'react'
import Nav from './components/Nav'
import EngravedBackdrop from './components/EngravedBackdrop'
import HexagonBackground from './components/HexagonBackground'
import GrowthRadarView from './views/GrowthRadarView'
import OverviewView from './views/OverviewView'
import StandingView from './views/StandingView'
import MatchingView from './views/MatchingView'
import RecruitPitchView from './views/RecruitPitchView'
import RoleSelectView from './views/RoleSelectView'
import './App.css'

// The 3D graph views pull in three.js, so they are code-split and only
// downloaded when a visitor actually opens Graph or Gap Radar.
const GraphView = lazy(() => import('./views/GraphView'))
const GapRadarView = lazy(() => import('./views/GapRadarView'))

export type View = 'growth' | 'overview' | 'graph' | 'match' | 'gaps' | 'pitch' | 'standing'
export type Role = 'amex' | 'sme'

const VIEWS: View[] = ['growth', 'overview', 'graph', 'match', 'gaps', 'pitch', 'standing']
const ROLE_KEY = 'connexion.role.v1'

const SME_VIEWS: View[] = ['standing', 'match']

const NAV_ITEMS_BY_ROLE: Record<Role, { id: View; label: string }[]> = {
  amex: [
    { id: 'growth', label: 'Growth Radar' },
    { id: 'overview', label: 'Overview' },
    { id: 'graph', label: 'Graph' },
    { id: 'gaps', label: 'Gap Radar' },
    { id: 'pitch', label: 'Recruit Pitch' },
  ],
  sme: [
    { id: 'standing', label: 'Your standing' },
    { id: 'match', label: 'Matching' },
  ],
}

function readViewFromHash(): View {
  const hash = window.location.hash.slice(1)
  return (VIEWS as string[]).includes(hash) ? (hash as View) : 'growth'
}

function loadRole(): Role | null {
  try {
    const raw = localStorage.getItem(ROLE_KEY)
    return raw === 'amex' || raw === 'sme' ? raw : null
  } catch {
    return null
  }
}

function saveRole(role: Role) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    /* localStorage unavailable, so the role just will not persist across visits */
  }
}

function clearRole() {
  try {
    localStorage.removeItem(ROLE_KEY)
  } catch {
    /* ignore */
  }
}

export default function App() {
  const [role, setRole] = useState<Role | null>(() => loadRole())
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

  function chooseRole(nextRole: Role) {
    saveRole(nextRole)
    setRole(nextRole)
    setView(nextRole === 'sme' ? 'standing' : 'growth')
  }

  function switchRole() {
    clearRole()
    setRole(null)
  }

  function generatePitch(prospectIdx: number, nextView: View) {
    setSelectedProspectIdx(prospectIdx)
    setView(nextView)
  }

  // Matching is the merchant's screen, so an admin landing on #match is sent
  // back to their own landing page rather than shown a queue that is not theirs.
  const effectiveView: View =
    role === 'sme'
      ? SME_VIEWS.includes(view)
        ? view
        : 'standing'
      : view === 'match'
        ? 'growth'
        : view

  // A redirected view should not leave a stale hash behind it. This has to sit
  // above the early return below: a hook after it would change the hook count
  // the moment a role is chosen, which React treats as a torn tree.
  useEffect(() => {
    if (role && effectiveView !== view) setView(effectiveView)
  })

  if (!role) {
    return (
      <div className="app-shell">
        <EngravedBackdrop />
        <HexagonBackground className="app-hexagon-backdrop" hexagonSize={55} />
        <RoleSelectView onSelect={chooseRole} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <EngravedBackdrop />
      <HexagonBackground className="app-hexagon-backdrop" hexagonSize={55} />
      <Nav
        view={effectiveView}
        onChange={setView}
        items={NAV_ITEMS_BY_ROLE[role]}
        role={role}
        onSwitchRole={switchRole}
      />

      {role === 'amex' && effectiveView === 'growth' && <GrowthRadarView onNavigate={setView} />}
      {role === 'sme' && effectiveView === 'standing' && (
        <StandingView onNavigate={setView} />
      )}
      {role === 'amex' && view === 'overview' && <OverviewView onNavigate={setView} />}
      {role === 'amex' && view === 'graph' && (
        <Suspense fallback={null}>
          <GraphView />
        </Suspense>
      )}
      {role === 'sme' && effectiveView === 'match' && <MatchingView />}
      {role === 'amex' && view === 'gaps' && (
        <Suspense fallback={null}>
          <GapRadarView onGeneratePitch={generatePitch} />
        </Suspense>
      )}
      {role === 'amex' && view === 'pitch' && (
        <RecruitPitchView selectedIdx={selectedProspectIdx} onSelect={setSelectedProspectIdx} />
      )}

      <footer className="app-footer">
        Synthetic demo data. All merchants, customers, scores, and uplift figures are invented
        to illustrate the system's reasoning, not real Amex data.
      </footer>
    </div>
  )
}
