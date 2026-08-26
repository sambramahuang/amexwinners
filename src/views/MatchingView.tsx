import {
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { MATCH_CANDIDATES, type MatchCandidate } from '../data/graphEngineData'
import type { PersonalityProfile } from '../data/personalityQuiz'
import { computePersonalityFit } from '../utils/personalityFit'
import { displayWeight, scoreCandidate, type MatchScore } from '../utils/circuitScore'
import ConsentGate from '../components/ConsentGate'
import CornerBrackets from '../components/CornerBrackets'
import IntroDraft from '../components/IntroDraft'
import MatchModal from '../components/MatchModal'
import PersonalityQuiz from '../components/PersonalityQuiz'
import './MatchingView.css'

const SWIPE_THRESHOLD = 120
const EXIT_DISTANCE = 700
const EXIT_DURATION_MS = 280

const PROFILE_KEY = 'circuit.personalityProfile.v1'
const SKIP_KEY = 'circuit.personalitySkipped.v1'
const CONSENT_KEY = 'circuit.matchingConsent.v1'

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

function loadConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

function savePersonalityProfile(profile: PersonalityProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    localStorage.removeItem(SKIP_KEY)
  } catch {
    /* localStorage unavailable, so the quiz just will not persist across visits */
  }
}

function saveSkipFlag() {
  try {
    localStorage.setItem(SKIP_KEY, '1')
  } catch {
    /* ignore */
  }
}

function saveConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, '1')
  } catch {
    /* ignore */
  }
}

type SwipeDirection = 'left' | 'right'
type RequestStatus = 'matched' | 'pending'

export type RankedCandidate = MatchCandidate & {
  personalityFit: number | null
  score: MatchScore
}

interface RequestEntry {
  id: number
  status: RequestStatus
}

export default function MatchingView() {
  const [consented, setConsented] = useState<boolean>(() => loadConsent())
  const [panel, setPanel] = useState<'queue' | 'requests'>('queue')
  const [qIndex, setQIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<SwipeDirection | null>(null)
  const [requests, setRequests] = useState<RequestEntry[]>([])
  const [passedCount, setPassedCount] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [modalCard, setModalCard] = useState<RankedCandidate | null>(null)
  const [profile, setProfile] = useState<PersonalityProfile | null>(() => loadProfile())
  const [showQuiz, setShowQuiz] = useState<boolean>(() => !loadProfile() && !loadSkipped())

  // Ranked by the Circuit match score, so the strongest partnership is offered
  // first rather than whichever candidate happens to sit first in the data.
  const rankedCandidates = useMemo<RankedCandidate[]>(() => {
    const scored = MATCH_CANDIDATES.map((c) => {
      const personalityFit = profile ? computePersonalityFit(c.personalityTags, profile) : null
      return { ...c, personalityFit, score: scoreCandidate(c, personalityFit) }
    })
    return scored.sort((a, b) => b.score.total - a.score.total)
  }, [profile])

  const total = rankedCandidates.length
  const current = rankedCandidates[qIndex] ?? null
  const peek1 = rankedCandidates[qIndex + 1] ?? null
  const peek2 = rankedCandidates[qIndex + 2] ?? null
  const queueDone = qIndex >= total
  const matchedCount = requests.filter((r) => r.status === 'matched').length
  const byId = useMemo(
    () => new Map(rankedCandidates.map((c) => [c.id, c])),
    [rankedCandidates],
  )

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
    const card = rankedCandidates[qIndex]
    setExiting(dir)
    setDragging(false)
    setTimeout(() => {
      setQIndex((i) => i + 1)
      setExiting(null)
      setDrag({ x: 0, y: 0 })
      if (dir === 'right') connect(card)
      else {
        setNotice(null)
        setPassedCount((n) => n + 1)
      }
    }, EXIT_DURATION_MS)
  }

  /**
   * Connecting sends a request. It becomes a match only if the other merchant
   * had already connected with Basin, which is the point: neither side's
   * contact details move until both have agreed.
   */
  function connect(card: RankedCandidate) {
    const mutual = card.alreadyConnected
    setRequests((r) => [...r, { id: card.id, status: mutual ? 'matched' : 'pending' }])
    if (mutual) {
      setNotice(null)
      setModalCard(card)
    } else {
      setNotice(`Request sent to ${card.name}. Waiting for them to connect back.`)
    }
  }

  const activeDx = dragging
    ? drag.x
    : exiting === 'right'
      ? EXIT_DISTANCE
      : exiting === 'left'
        ? -EXIT_DISTANCE
        : 0
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
    setPassedCount(0)
    setDragging(false)
    setDrag({ x: 0, y: 0 })
    setExiting(null)
    setNotice(null)
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

  function acceptConsent() {
    saveConsent()
    setConsented(true)
  }

  if (!consented) {
    return (
      <main className="matching-main matching-main-gated">
        <div className="matching-column">
          <div className="matching-header">
            <h1>Matching queue</h1>
            <p>
              Merchants already on Amex, ranked by a match score built from
              closed-loop transaction data.
            </p>
          </div>
          <ConsentGate onAccept={acceptConsent} />
        </div>
      </main>
    )
  }

  const showQueue = panel === 'queue'

  return (
    <main className="matching-main">
      <div className="matching-column">
        <div className="matching-header">
          <h1>Matching queue, Basin Coffee Roasters</h1>
          <p>
            Candidates already on Amex, ranked by Circuit match score. Swipe or use
            the controls below. Connecting sends a request; contact details are
            released only if they connect back.
          </p>
        </div>

        <div className="panel-tabs">
          <button
            className={`panel-tab ${showQueue ? 'is-active' : ''}`}
            onClick={() => setPanel('queue')}
          >
            Discover
          </button>
          <button
            className={`panel-tab ${!showQueue ? 'is-active' : ''}`}
            onClick={() => setPanel('requests')}
          >
            Requests
            {requests.length > 0 && <span className="panel-tab-count">{requests.length}</span>}
          </button>
        </div>

        {showQuiz && showQueue && (
          <PersonalityQuiz onComplete={handleQuizComplete} onSkip={handleQuizSkip} />
        )}

        {!showQueue && (
          <RequestList requests={requests} byId={byId} onBrowse={() => setPanel('queue')} />
        )}

        {showQueue && !showQuiz && notice && <div className="queue-notice">{notice}</div>}

        {showQueue && !showQuiz && !queueDone && (
          <>
            <div className="card-stack">
              {peek2 && <div className="stack-card peek-2" />}
              {peek1 && <div className="stack-card peek-1" />}
              {current && (
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
                    CONNECT
                  </div>
                  <div className="swipe-badge swipe-badge-pass" style={{ opacity: nopeOpacity }}>
                    PASS
                  </div>

                  <div className="swipe-card-score">
                    <div className="score-ring">
                      <span className="score-ring-value">{current.score.total.toFixed(1)}</span>
                      <span className="score-ring-unit">OUT OF 10</span>
                    </div>
                    <div>
                      <div className="score-ring-label">Circuit match score</div>
                      <div className="score-ring-note">
                        You see the score, not the other merchant's figures.
                      </div>
                    </div>
                  </div>

                  <div className="swipe-card-top">
                    <div className="swipe-card-name">{current.name}</div>
                    <div className="swipe-card-category">
                      {current.category} · {current.region}
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

                  <div className="swipe-card-symmetry">
                    <div className="swipe-card-symmetry-label">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="5" y1="9" x2="19" y2="9" />
                        <line x1="5" y1="15" x2="19" y2="15" />
                      </svg>
                      Value symmetry
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

                  <div className="swipe-card-reasons">
                    <div className="swipe-card-reasons-label">What drove this score</div>
                    <div className="reason-chips">
                      {current.score.tags.map((tag) => (
                        <span className="reason-chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
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
              <button className="swipe-btn swipe-btn-match" onClick={() => swipeAway('right')} aria-label="Connect">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {showQueue && !showQuiz && queueDone && (
          <div className="queue-done">
            <div className="queue-done-title">Queue cleared</div>
            <p>
              Reviewed all {total} candidates in this cluster. You sent {requests.length}{' '}
              requests, {matchedCount} of which connected back, and passed on {passedCount}.
            </p>
            <div className="queue-done-actions">
              <button className="btn btn-ghost" onClick={resetQueue}>
                Restart session
              </button>
              <button className="btn btn-primary" onClick={() => setPanel('requests')}>
                See your requests
              </button>
            </div>
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
              <span>Connected</span>
              <span className="sidebar-value-accent">{matchedCount}</span>
            </div>
            <div className="sidebar-row">
              <span>Awaiting reply</span>
              <span>{requests.length - matchedCount}</span>
            </div>
            <div className="sidebar-row sidebar-row-last">
              <span>Passed</span>
              <span>{passedCount}</span>
            </div>
          </div>

          {showQueue && current && (
            <div className="sidebar-card">
              <div className="sidebar-label">How this score was built</div>
              <div className="score-breakdown">
                {current.score.components.map((c) => (
                  <div className="score-component" key={c.key}>
                    <div className="score-component-head">
                      <span className="score-component-label">
                        {c.label}
                        <span className="score-component-weight">
                          weight {displayWeight(current.score.components, c)}%
                        </span>
                      </span>
                      <span className="score-component-value">{c.score.toFixed(1)}</span>
                    </div>
                    <div className="score-component-track">
                      <div
                        className="score-component-fill"
                        style={{ width: `${c.score * 10}%` }}
                      />
                    </div>
                    <p className="score-component-detail">{c.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-card">
            <div className="sidebar-label">Partnership profile</div>
            <p className="sidebar-personality-status">
              {profile
                ? 'Profile answered, weighted lightest of the five components. Transaction data still leads.'
                : 'Not answered. Scored on transaction data only.'}
            </p>
            <button className="btn btn-ghost sidebar-vibe-btn" onClick={() => setShowQuiz(true)}>
              {profile ? 'Retake questionnaire' : 'Complete questionnaire'}
            </button>
          </div>
        </aside>
      )}

      {modalCard && (
        <MatchModal
          candidate={modalCard}
          personalityProfile={profile}
          score={modalCard.score}
          onClose={() => setModalCard(null)}
        />
      )}
    </main>
  )
}

interface RequestListProps {
  requests: RequestEntry[]
  byId: Map<number, RankedCandidate>
  onBrowse: () => void
}

function RequestList({ requests, byId, onBrowse }: RequestListProps) {
  const rows = requests
    .map((r) => ({ ...r, candidate: byId.get(r.id) }))
    .filter((r): r is RequestEntry & { candidate: RankedCandidate } => Boolean(r.candidate))
  const matched = rows.filter((r) => r.status === 'matched')
  const pending = rows.filter((r) => r.status === 'pending')

  if (rows.length === 0) {
    return (
      <div className="queue-done">
        <div className="queue-done-title">No requests yet</div>
        <p>
          Every merchant you connect with lands here, whether or not they have
          answered.
        </p>
        <button className="btn btn-ghost" onClick={onBrowse}>
          Browse the queue
        </button>
      </div>
    )
  }

  return (
    <div className="request-list">
      <section>
        <div className="request-section-label">Connected ({matched.length})</div>
        <p className="request-section-note">
          Both sides agreed, so contact details are released and Circuit has drafted
          your introduction.
        </p>
        {matched.length === 0 ? (
          <div className="request-empty">
            Nothing here yet. A merchant appears once they connect back.
          </div>
        ) : (
          matched.map((r) => (
            <RequestRow key={r.id} candidate={r.candidate} status="matched" />
          ))
        )}
      </section>

      <section>
        <div className="request-section-label">
          Waiting on the other merchant ({pending.length})
        </div>
        <p className="request-section-note">
          Your request is in. Neither side gets the other's contact details until they
          connect back.
        </p>
        {pending.length === 0 ? (
          <div className="request-empty">No requests waiting.</div>
        ) : (
          pending.map((r) => (
            <RequestRow key={r.id} candidate={r.candidate} status="pending" />
          ))
        )}
      </section>
    </div>
  )
}

interface RequestRowProps {
  candidate: RankedCandidate
  status: RequestStatus
}

function RequestRow({ candidate, status }: RequestRowProps) {
  const [open, setOpen] = useState(false)
  const matched = status === 'matched'

  return (
    <div className="request-item">
      <div className="request-row">
        <div className={`request-score ${matched ? 'is-matched' : ''}`}>
          {candidate.score.total.toFixed(1)}
        </div>
        <div className="request-identity">
          <div className="request-name">{candidate.name}</div>
          <div className="request-meta">
            {candidate.category} · {candidate.region}
          </div>
        </div>
        <div className="request-actions">
          <span className={`request-status ${matched ? 'is-matched' : ''}`}>
            {matched ? 'Connected' : 'Waiting for their reply'}
          </span>
          {matched && (
            <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)}>
              {open ? 'Hide draft' : 'Intro draft'}
            </button>
          )}
        </div>
      </div>
      {matched && open && <IntroDraft candidate={candidate} score={candidate.score} />}
    </div>
  )
}
