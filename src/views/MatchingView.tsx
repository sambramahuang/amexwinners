import { useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { Role } from '../App'
import { MATCH_CANDIDATES, TIER_LABELS, type MatchCandidate } from '../data/graphEngineData'
import type { PersonalityProfile } from '../data/personalityQuiz'
import { computeBlendedScore, computePersonalityFit } from '../utils/personalityFit'
import { redactCandidateName } from '../utils/redactCandidateName'
import CornerBrackets from '../components/CornerBrackets'
import MatchModal from '../components/MatchModal'
import PersonalityQuiz from '../components/PersonalityQuiz'
import './MatchingView.css'

const SWIPE_THRESHOLD = 120
const EXIT_DISTANCE = 700
const EXIT_DURATION_MS = 320

const PROFILE_KEY = 'circuit.personalityProfile.v1'
const SKIP_KEY = 'circuit.personalitySkipped.v1'

function loadProfile(): PersonalityProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as PersonalityProfile) : null
  } catch {
    return null
  }
}

function loadSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === '1'
  } catch {
    return false
  }
}

function savePersonalityProfile(profile: PersonalityProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.removeItem(SKIP_KEY)
  } catch {
    /* localStorage unavailable — quiz just won't persist across visits */
  }
}

function saveSkipFlag() {
  try {
    localStorage.setItem(SKIP_KEY, '1')
  } catch {
    /* ignore */
  }
}

type SwipeDirection = 'left' | 'right'
export type RankedCandidate = MatchCandidate & { personalityFit: number | null }

interface MatchingViewProps {
  role: Role
}

export default function MatchingView({ role }: MatchingViewProps) {
  const hideIdentity = role === 'sme'
  const [qIndex, setQIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<SwipeDirection | null>(null)
  const [matchedNames, setMatchedNames] = useState<string[]>([])
  const [passedCount, setPassedCount] = useState(0)
  const [modalCard, setModalCard] = useState<RankedCandidate | null>(null)
  const [previewCard, setPreviewCard] = useState<RankedCandidate | null>(null)
  const [profile, setProfile] = useState<PersonalityProfile | null>(() => loadProfile())
  const [showQuiz, setShowQuiz] = useState<boolean>(() => !loadProfile() && !loadSkipped())

  const rankedCandidates = useMemo<RankedCandidate[]>(() => {
    const withFit = MATCH_CANDIDATES.map((c) => ({
      ...c,
      personalityFit: profile ? computePersonalityFit(c.personalityTags, profile) : null,
    }))
    if (!profile) return withFit
    return [...withFit].sort(
      (a, b) =>
        computeBlendedScore(b.overlapPct, b.personalityFit) - computeBlendedScore(a.overlapPct, a.personalityFit),
    )
  }, [profile])

  const total = rankedCandidates.length
  const current = rankedCandidates[qIndex] ?? null
  const peek1 = rankedCandidates[qIndex + 1] ?? null
  const peek2 = rankedCandidates[qIndex + 2] ?? null
  const matchDone = qIndex >= total
  const matchedCount = matchedNames.length

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    setStart({ x: e.clientX, y: e.clientY })
    setDrag({ x: 0, y: 0 })
  }

  function onMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    setDrag({ x: e.clientX - start.x, y: (e.clientY - start.y) * 0.2 })
  }

  function onUp() {
    if (!dragging) return
    if (drag.x > SWIPE_THRESHOLD) swipeAway('right')
    else if (drag.x < -SWIPE_THRESHOLD) swipeAway('left')
    else {
      setDragging(false)
      setDrag({ x: 0, y: 0 })
    }
  }

  function swipeAway(dir: SwipeDirection) {
    if (exiting) return
    const card = rankedCandidates[qIndex]
    setExiting(dir)
    setDragging(false)
    setTimeout(() => {
      setQIndex((i) => i + 1)
      setExiting(null)
      setDrag({ x: 0, y: 0 })
      if (dir === 'right') {
        setMatchedNames((names) => [...names, card.name])
        setModalCard(card)
      } else {
        setPassedCount((n) => n + 1)
      }
    }, EXIT_DURATION_MS)
  }

  const activeDx = dragging ? drag.x : exiting === 'right' ? EXIT_DISTANCE : exiting === 'left' ? -EXIT_DISTANCE : 0
  const activeDy = dragging ? drag.y : exiting ? -40 : 0
  const rot = activeDx / 18
  const cardStyle: CSSProperties = {
    transform: `translate(${activeDx}px, ${activeDy}px) rotate(${rot}deg)`,
    transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(.2,.8,.3,1), opacity 0.32s',
    opacity: exiting ? 0.4 : 1,
    cursor: dragging ? 'grabbing' : 'grab',
  }
  const likeOpacity = Math.min(1, Math.max(0, activeDx / 100))
  const nopeOpacity = Math.min(1, Math.max(0, -activeDx / 100))

  function resetQueue() {
    setQIndex(0)
    setMatchedNames([])
    setPassedCount(0)
    setDragging(false)
    setDrag({ x: 0, y: 0 })
    setExiting(null)
  }

  function restart() {
    resetQueue()
  }

  function handleQuizComplete(newProfile: PersonalityProfile) {
    savePersonalityProfile(newProfile)
    setProfile(newProfile)
    setShowQuiz(false)
    resetQueue()
  }

  function handleQuizSkip() {
    saveSkipFlag()
    setShowQuiz(false)
  }

  return (
    <main className="matching-main">
      <div className="matching-column">
        <div className="matching-header">
          <h1>Matching queue — Basin Coffee Roasters</h1>
          <p>Candidates already on Amex, ranked by graph signal strength. Swipe or use the controls below.</p>
          <p className="matching-tier-blurb">
            Matches start as a single linked offer and can grow into a recurring or longer-term relationship as
            performance holds up over time.
          </p>
        </div>

        {showQuiz && <PersonalityQuiz onComplete={handleQuizComplete} onSkip={handleQuizSkip} />}

        {!showQuiz && !matchDone && (
          <>
            <div className="card-stack">
              {peek2 && <div className="stack-card peek-2" />}
              {peek1 && <div className="stack-card peek-1" />}
              {current && (
                <div className="swipe-card-mount" key={current.id}>
                <div
                  className="swipe-card"
                  style={cardStyle}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerLeave={onUp}
                >
                  <CornerBrackets />

                  <div className="swipe-badge swipe-badge-match" style={{ opacity: likeOpacity }}>
                    MATCH
                  </div>
                  <div className="swipe-badge swipe-badge-pass" style={{ opacity: nopeOpacity }}>
                    PASS
                  </div>

                  <div className="swipe-card-top">
                    <div className="swipe-card-logo">LOGO</div>
                    <div className="swipe-card-name">{hideIdentity ? current.category : current.name}</div>
                    <div className="swipe-card-category">
                      {hideIdentity ? 'Identity revealed once you match' : current.category}
                    </div>
                  </div>

                  <div className="swipe-card-overlap">
                    <svg width="150" height="52" viewBox="0 0 150 52">
                      <line
                        x1="20"
                        y1="26"
                        x2="130"
                        y2="26"
                        stroke="#006fcf"
                        strokeWidth={0.6 + current.overlapPct / 22}
                      />
                      <circle cx="20" cy="26" r="8" fill="#003d75" />
                      <circle cx="130" cy="26" r="8" fill="#006fcf" />
                      <text x="20" y="46" fontSize="8" fill="#0b1c33" opacity="0.65" textAnchor="middle" fontFamily="IBM Plex Sans">
                        Basin
                      </text>
                      <text x="130" y="46" fontSize="8" fill="#0b1c33" opacity="0.65" textAnchor="middle" fontFamily="IBM Plex Sans">
                        {current.shortName}
                      </text>
                    </svg>
                    <div>
                      <div className="swipe-card-overlap-pct">{current.overlapPct}%</div>
                      <div className="swipe-card-overlap-label">Customer overlap</div>
                    </div>
                  </div>

                  {current.personalityFit !== null && (
                    <div className="swipe-card-vibe">
                      <span className="swipe-card-vibe-label">Partnership fit (secondary, self-reported)</span>
                      <span className="swipe-card-vibe-value">{current.personalityFit}%</span>
                    </div>
                  )}

                  <div className="swipe-card-sequential">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006fcf" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p>{current.sequential}</p>
                  </div>

                  <div className="swipe-card-symmetry">
                    <div className="swipe-card-symmetry-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="5" y1="9" x2="19" y2="9" />
                        <line x1="5" y1="15" x2="19" y2="15" />
                      </svg>
                      Value symmetry
                      <span className={`tier-badge tier-badge-${current.tier}`}>{TIER_LABELS[current.tier]}</span>
                    </div>
                    <div className="symmetry-bars">
                      <div className="symmetry-bar-row">
                        <span className="symmetry-bar-name">Basin</span>
                        <div className="symmetry-bar-track">
                          <div
                            className="symmetry-bar-fill symmetry-bar-fill-you"
                            style={{ width: `${Math.min(100, (current.upliftYou / 28) * 100)}%` }}
                          />
                        </div>
                        <span className="symmetry-bar-value">+{current.upliftYou}%</span>
                      </div>
                      <div className="symmetry-bar-row">
                        <span className="symmetry-bar-name">{current.shortName}</span>
                        <div className="symmetry-bar-track">
                          <div
                            className="symmetry-bar-fill symmetry-bar-fill-them"
                            style={{ width: `${Math.min(100, (current.upliftThem / 28) * 100)}%` }}
                          />
                        </div>
                        <span className="symmetry-bar-value">+{current.upliftThem}%</span>
                      </div>
                    </div>
                    <div className="symmetry-note" style={{ color: current.balanceColor }}>
                      {current.balanceNote}
                    </div>
                  </div>

                  <div className="swipe-card-terms">
                    <div className="swipe-card-terms-label">Suggested terms</div>
                    <p>{current.terms}</p>
                  </div>

                  <button
                    className="btn btn-ghost swipe-card-proposal-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewCard(current)
                    }}
                  >
                    See Amex's proposal &amp; predicted benefits
                  </button>
                </div>
                </div>
              )}
            </div>

            <div className="swipe-controls">
              <button className="swipe-btn swipe-btn-pass" onClick={() => swipeAway('left')} aria-label="Pass">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <button className="swipe-btn swipe-btn-match" onClick={() => swipeAway('right')} aria-label="Match">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {!showQuiz && matchDone && (
          <div className="queue-done">
            <div className="queue-done-title">Queue cleared</div>
            <p>
              Reviewed all {total} candidates in this cluster — {matchedCount} matched, {passedCount} passed.
            </p>
            <button className="btn btn-ghost" onClick={restart}>
              Restart session
            </button>
          </div>
        )}
      </div>

      {!showQuiz && (
        <aside className="matching-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-label">Session</div>
            <div className="sidebar-row">
              <span>Reviewed</span>
              <span>
                {Math.min(qIndex, total)} / {total}
              </span>
            </div>
            <div className="sidebar-row">
              <span>Matched</span>
              <span className="sidebar-value-accent">{matchedCount}</span>
            </div>
            <div className="sidebar-row sidebar-row-last">
              <span>Passed</span>
              <span>{passedCount}</span>
            </div>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-label">Matched this session</div>
            <div className="sidebar-chips">
              {matchedNames.map((n) => (
                <span className="sidebar-chip" key={n}>
                  {n}
                </span>
              ))}
              {matchedNames.length === 0 && <span className="sidebar-empty">None yet — swipe right to match.</span>}
            </div>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-label">Partnership profile</div>
            <p className="sidebar-personality-status">
              {profile
                ? 'Profile answered — nudging rank up to 30%, transaction data still leads.'
                : 'Not answered — ranked by transaction data only.'}
            </p>
            <button className="btn btn-ghost sidebar-vibe-btn" onClick={() => setShowQuiz(true)}>
              {profile ? 'Retake questionnaire' : 'Complete questionnaire'}
            </button>
          </div>
        </aside>
      )}

      {modalCard && (
        <MatchModal candidate={modalCard} personalityProfile={profile} onClose={() => setModalCard(null)} />
      )}

      {previewCard && (
        <MatchModal
          candidate={previewCard}
          personalityProfile={profile}
          mode="preview"
          onClose={() => setPreviewCard(null)}
        />
      )}
    </main>
  )
}
