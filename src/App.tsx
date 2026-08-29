import { lazy, Suspense, useEffect, useState } from 'react'
import Nav from './components/Nav'
import HexagonBackground from './components/HexagonBackground'
import PitchModal from './components/PitchModal'
import StandingView from './views/StandingView'
import MatchingView from './views/MatchingView'
import RoleSelectView from './views/RoleSelectView'
import { PROSPECT_TARGETS } from './data/graphEngineData'
import './App.css'

// The 3D graph view pulls in three.js, so it is code-split and only
// downloaded when a visitor actually opens Gap Radar.
const GapRadarView = lazy(() => import('./views/GapRadarView'))

export type View = 'match' | 'gaps' | 'standing'
export type Role = 'amex' | 'sme'

const VIEWS: View[] = ['match', 'gaps', 'standing']
const ROLE_KEY = 'connexion.role.v1'

const SME_VIEWS: View[] = ['standing', 'match']

const NAV_ITEMS_BY_ROLE: Record<Role, { id: View; label: string }[]> = {
  amex: [{ id: 'gaps', label: 'Gap Radar' }],
  sme: [
    { id: 'standing', label: 'Your standing' },
    { id: 'match', label: 'Matching' },
  ],
}

function readViewFromHash(): View {
  const hash = window.location.hash.slice(1)
  return (VIEWS as string[]).includes(hash) ? (hash as View) : 'gaps'
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
  const [pitchProspectIdx, setPitchProspectIdx] = useState<number | null>(null)

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
    setView(nextRole === 'sme' ? 'standing' : 'gaps')
  }

  function switchRole() {
    clearRole()
    setRole(null)
  }

  function generatePitch(prospectIdx: number) {
    setPitchProspectIdx(prospectIdx)
  }

  // Matching is the merchant's screen, so an admin landing on #match is sent
  // back to their own landing page rather than shown a queue that is not theirs.
  const effectiveView: View =
    role === 'sme'
      ? SME_VIEWS.includes(view)
        ? view
        : 'standing'
      : view === 'match'
        ? 'gaps'
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
        <HexagonBackground className="app-hexagon-backdrop" hexagonSize={55} />
        <RoleSelectView onSelect={chooseRole} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <HexagonBackground className="app-hexagon-backdrop" hexagonSize={55} />
      <Nav
        view={effectiveView}
        onChange={setView}
        items={NAV_ITEMS_BY_ROLE[role]}
        role={role}
        onSwitchRole={switchRole}
      />

      {role === 'sme' && effectiveView === 'standing' && (
        <StandingView onNavigate={setView} />
      )}
      {role === 'sme' && effectiveView === 'match' && <MatchingView />}
      {role === 'amex' && view === 'gaps' && (
        <Suspense fallback={null}>
          <GapRadarView onGeneratePitch={generatePitch} />
        </Suspense>
      )}

      {pitchProspectIdx !== null && PROSPECT_TARGETS[pitchProspectIdx] && (
        <PitchModal
          prospect={PROSPECT_TARGETS[pitchProspectIdx]}
          onClose={() => setPitchProspectIdx(null)}
        />
      )}

      <footer className="app-footer">
        Synthetic demo data. All merchants, customers, scores, and uplift figures are invented
        to illustrate the system's reasoning, not real Amex data.
      </footer>
    </div>
  )
}
