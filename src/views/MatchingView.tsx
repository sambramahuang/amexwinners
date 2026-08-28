import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { Role } from '../App'
import { MATCH_CANDIDATES, type MatchCandidate } from '../data/graphEngineData'
import CornerBrackets from '../components/CornerBrackets'
import MatchModal from '../components/MatchModal'
import MerchantMark from '../components/MerchantMark'
import { scoreBand, scoreMatch } from '../utils/matchScore'
import ConsentGate from '../components/ConsentGate'
import './MatchingView.css'

const SWIPE_THRESHOLD = 120
const EXIT_DISTANCE = 700
const EXIT_DURATION_MS = 320

const CONSENT_KEY = 'circuit.matchingConsent.v2'
const SWIPE_HINT_KEY = 'circuit.swipeHintSeen.v1'

/** The date consent was given, or null if it has not been. */
function loadConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    return null
  }
}

function saveConsent(date: string) {
  try {
    localStorage.setItem(CONSENT_KEY, date)
  } catch {
    /* localStorage unavailable, so consent just will not persist across visits */
  }
}

function clearConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch {
    /* ignore */
  }
}

type SwipeDirection = 'left' | 'right'
export type RankedCandidate = MatchCandidate

interface MatchingViewProps {
  role: Role
}

export default function MatchingView({ role }: MatchingViewProps) {
  const [qIndex, setQIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [exiting, setExiting] = useState<SwipeDirection | null>(null)
  const [likedIds, setLikedIds] = useState<number[]>([])
  // The stack reserves exactly the height of the card in it, measured rather
  // than guessed, so the controls always sit the same distance below whatever
  // the tallest card in the pool happens to be.
  const cardRef = useRef<HTMLDivElement>(null)
  const [stackHeight, setStackHeight] = useState<number>()
  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const hintSeen = useRef(false)
  const [panel, setPanel] = useState<'discover' | 'requests'>('discover')
  const [modalCard, setModalCard] = useState<RankedCandidate | null>(null)
  const [previewCard, setPreviewCard] = useState<RankedCandidate | null>(null)
  const [consentedOn, setConsentedOn] = useState<string | null>(() => loadConsent())
  const [reviewingConsent, setReviewingConsent] = useState(false)
  const consented = consentedOn !== null

  // Ranked on the closed-loop transaction signal alone.
  const rankedCandidates = useMemo<RankedCandidate[]>(
    () =>
      [...MATCH_CANDIDATES].sort(
        (a, b) => scoreMatch(b).total - scoreMatch(a).total,
      ),
    [],
  )

  const liked = MATCH_CANDIDATES.filter((c) => likedIds.includes(c.id))
  const mutual = liked.filter((c) => c.likedYouBack)
  const waiting = liked.filter((c) => !c.likedYouBack)

  const total = rankedCandidates.length
  const current = rankedCandidates[qIndex] ?? null
  const peek1 = rankedCandidates[qIndex + 1] ?? null
  const peek2 = rankedCandidates[qIndex + 2] ?? null
  const matchDone = qIndex >= total

  useEffect(() => {
    try {
      hintSeen.current = localStorage.getItem(SWIPE_HINT_KEY) === '1'
    } catch {
      hintSeen.current = true
    }
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    // The rendered box, not the layout box: the card sits under a perspective
    // transform, so offsetHeight overshoots what is actually on screen. Held
    // still during a drag, when rotation is changing the rendered height.
    const measure = () => {
      if (dragging || exiting) return
      const stack = el.closest('.card-stack')
      if (!stack) return
      // Card top sits inset from the stack top, so the reserve is that offset
      // plus the rendered height, or the controls ride up over the card.
      const box = el.getBoundingClientRect()
      const offset = box.top - stack.getBoundingClientRect().top
      setStackHeight(Math.ceil(offset + box.height))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [qIndex, consented, panel, dragging, exiting])

  function dismissHint() {
    setShowSwipeHint(false)
    hintSeen.current = true
    try {
      localStorage.setItem(SWIPE_HINT_KEY, '1')
    } catch {
      /* localStorage unavailable, so the hint shows again next visit */
    }
  }

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Shown the first time a merchant puts a finger on the card, which is the
    // moment they need it, rather than as a modal before they have seen one.
    if (!hintSeen.current) setShowSwipeHint(true)
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
      if (showSwipeHint) dismissHint()
      if (dir !== 'right') return
      setLikedIds((ids) => (ids.includes(card.id) ? ids : [...ids, card.id]))
      // A like on its own goes into Requests. Only a like that runs both ways
      // is a match, and only a match opens the dialog and releases the email.
      if (card.likedYouBack) setModalCard(card)
    }, EXIT_DURATION_MS)
  }

  const activeDx = dragging ? drag.x : exiting === 'right' ? EXIT_DISTANCE : exiting === 'left' ? -EXIT_DISTANCE : 0
  const activeDy = dragging ? drag.y : exiting ? -40 : 0
  const rot = activeDx / 18
  // The card turns in space as it goes, rather than sliding flat across the
  // page: it yaws away from the drag, pitches slightly with the vertical, and
  // pulls back toward the viewer so it reads as leaving the stack.
  const yaw = Math.max(-26, Math.min(26, activeDx / 9))
  const pitch = Math.max(-10, Math.min(10, -activeDy / 6))
  const depth = -Math.min(90, Math.abs(activeDx) / 3)
  const cardStyle: CSSProperties = {
    transform: [
      'perspective(1200px)',
      `translate3d(${activeDx}px, ${activeDy}px, ${depth}px)`,
      `rotateY(${yaw}deg)`,
      `rotateX(${pitch}deg)`,
      `rotate(${rot}deg)`,
    ].join(' '),
    transition: dragging
      ? 'none'
      : 'transform 0.42s cubic-bezier(0.22, 0.8, 0.28, 1), opacity 0.36s',
    opacity: exiting ? 0 : 1,
    cursor: dragging ? 'grabbing' : 'grab',
  }
  const likeOpacity = Math.min(1, Math.max(0, activeDx / 100))
  const nopeOpacity = Math.min(1, Math.max(0, -activeDx / 100))

  function resetQueue() {
    setQIndex(0)
    setLikedIds([])
    setDragging(false)
    setDrag({ x: 0, y: 0 })
    setExiting(null)
  }

  function restart() {
    resetQueue()
  }

  function acceptConsent() {
    const today = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    saveConsent(today)
    setConsentedOn(today)
    setReviewingConsent(false)
  }

  function withdrawConsent() {
    clearConsent()
    setConsentedOn(null)
    setReviewingConsent(false)
  }

  return (
    <main className="matching-main">
      <div className="matching-column">
        <div className="matching-header">
          <h1>Matching queue</h1>
          <p>Candidates already on Amex, ranked by graph signal strength. Swipe or use the controls below.</p>
          <p className="matching-tier-blurb">
            Matches start as a single linked offer and can grow into a recurring or longer-term relationship as
            performance holds up over time.
          </p>
        </div>

        {!consented && <ConsentGate onAccept={acceptConsent} />}

        {consented && reviewingConsent && (
          <ConsentGate
            onAccept={acceptConsent}
            onCancel={() => setReviewingConsent(false)}
            grantedOn={consentedOn}
            onWithdraw={withdrawConsent}
          />
        )}

        {consented && !reviewingConsent && (
          <div className="panel-tabs">
            <button
              className={`panel-tab ${panel === 'discover' ? 'is-active' : ''}`}
              onClick={() => setPanel('discover')}
            >
              Discover
            </button>
            <button
              className={`panel-tab ${panel === 'requests' ? 'is-active' : ''}`}
              onClick={() => setPanel('requests')}
            >
              Requests
              {liked.length > 0 && <span className="panel-tab-count">{liked.length}</span>}
            </button>
          </div>
        )}

        {consented && !reviewingConsent && panel === 'requests' && (
          <RequestPanel
            mutual={mutual}
            waiting={waiting}
            onBrowse={() => setPanel('discover')}
            onOpen={setModalCard}
          />
        )}

        {consented && !reviewingConsent && panel === 'discover' && !matchDone && (
          <>
            <div className="card-stack" style={stackHeight ? { height: stackHeight } : undefined}>
              {peek2 && <div className="stack-card peek-2" />}
              {peek1 && <div className="stack-card peek-1" />}
              {current && (
                <div className="swipe-card-mount" key={current.id}>
                <div
                  ref={cardRef}
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

                  {showSwipeHint && (
                    <div className="swipe-hint" onPointerDown={dismissHint}>
                      <div className="swipe-hint-side">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span className="swipe-hint-label">Swipe left</span>
                        <span className="swipe-hint-word">to pass</span>
                      </div>
                      <div className="swipe-hint-rule" />
                      <div className="swipe-hint-side">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        <span className="swipe-hint-label">Swipe right</span>
                        <span className="swipe-hint-word">to like</span>
                      </div>
                    </div>
                  )}

                  <div className="swipe-card-top">
                    <MerchantMark candidate={current} size={54} />
                    <div className="swipe-card-name">{current.name}</div>
                    <div className="swipe-card-category">{current.category}</div>
                  </div>

                  <div className="swipe-card-score">
                    <div className="score-dial">
                      <svg viewBox="0 0 112 112" width="112" height="112">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(11,28,51,0.09)" strokeWidth="9" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray={`${(scoreMatch(current).total / 100) * 301.6} 301.6`}
                          transform="rotate(-90 56 56)"
                        />
                      </svg>
                      <span className="score-dial-value">{scoreMatch(current).total}</span>
                    </div>
                    <div className="score-dial-band">{scoreBand(scoreMatch(current).total)}</div>
                    <div className="score-dial-note">Match score out of 100</div>
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

                  <div className="swipe-card-sequential">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#006fcf" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p>{current.sequential}</p>
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
              <button className="swipe-btn swipe-btn-pass" onClick={() => swipeAway('left')} aria-label="Skip">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <button className="swipe-btn swipe-btn-match" onClick={() => swipeAway('right')} aria-label="Like">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {consented && !reviewingConsent && panel === 'discover' && matchDone && (
          <div className="queue-done">
            <div className="queue-done-title">Queue cleared</div>
            <p>
              You liked {liked.length} of them. {mutual.length} liked you back, so
              those are matches you can write to now.
            </p>
            <div className="queue-done-actions">
              <button className="btn btn-ghost" onClick={restart}>
                Start again
              </button>
              <button className="btn btn-primary" onClick={() => setPanel('requests')}>
                Open requests
              </button>
            </div>
          </div>
        )}
      </div>

      {consented && !reviewingConsent && (
        <aside className="matching-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-label">This session</div>
            <div className="sidebar-row">
              <span>Liked</span>
              <span className="sidebar-value-accent">{liked.length}</span>
            </div>
            <div className="sidebar-row sidebar-row-last">
              <span>Matched</span>
              <span className="sidebar-value-accent">{mutual.length}</span>
            </div>
          </div>
          <div className="sidebar-card">
            <div className="sidebar-label">Data sharing</div>
            <p className="sidebar-consent-status">
              Consent given on {consentedOn}. Your name, logo and match score are
              visible to merchants in your queue.
            </p>
            <button
              className="btn btn-ghost sidebar-consent-btn"
              onClick={() => setReviewingConsent(true)}
            >
              Review or withdraw
            </button>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-label">Liked this session</div>
            <div className="sidebar-chips">
              {liked.map((c) => (
                <span className="sidebar-chip" key={c.id}>
                  {c.name}
                </span>
              ))}
              {liked.length === 0 && (
                <span className="sidebar-empty">None yet. Tap the heart to like one.</span>
              )}
            </div>
          </div>
        </aside>
      )}

      {modalCard && (
        <MatchModal
          candidate={modalCard}
          mode="match"
          /* The card promises identity is revealed once you match, so this is
             the moment it is. The preview below stays anonymous. */
          smeVoice={role === 'sme'}
          onClose={() => setModalCard(null)}
        />
      )}

      {previewCard && (
        <MatchModal
          candidate={previewCard}
          mode="preview"
          onClose={() => setPreviewCard(null)}
        />
      )}
    </main>
  )
}

interface RequestPanelProps {
  mutual: MatchCandidate[]
  waiting: MatchCandidate[]
  onBrowse: () => void
  onOpen: (candidate: MatchCandidate) => void
}

/**
 * Everything the merchant has liked, split by whether it was returned.
 * A match is the only state that releases the introduction email.
 */
function RequestPanel({ mutual, waiting, onBrowse, onOpen }: RequestPanelProps) {
  if (mutual.length === 0 && waiting.length === 0) {
    return (
      <div className="queue-done">
        <div className="queue-done-title">Nothing here yet</div>
        <p>Everyone you like lands here, whether or not they like you back.</p>
        <button className="btn btn-ghost" onClick={onBrowse}>
          Browse the queue
        </button>
      </div>
    )
  }

  return (
    <div className="request-list">
      <section>
        <div className="request-section-label">Matches ({mutual.length})</div>
        <p className="request-section-note">
          They liked you back, so identities are released and you can write to them.
        </p>
        {mutual.length === 0 ? (
          <div className="request-empty">
            None yet. A merchant appears here the moment they like you back.
          </div>
        ) : (
          mutual.map((c) => (
            <div className="request-row" key={c.id}>
              <MerchantMark candidate={c} size={44} />
              <div className="request-identity">
                <div className="request-name">{c.name}</div>
                <div className="request-meta">
                  {c.category} · {scoreMatch(c).total} match score
                </div>
              </div>
              <div className="request-actions">
                <span className="request-status is-matched">Matched</span>
                <button className="btn btn-ghost" onClick={() => onOpen(c)}>
                  Write to them
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <div className="request-section-label">Liked, waiting ({waiting.length})</div>
        <p className="request-section-note">
          They have not opened your like yet. Neither side gets contact details
          until they do.
        </p>
        {waiting.length === 0 ? (
          <div className="request-empty">Nothing waiting.</div>
        ) : (
          waiting.map((c) => (
            <div className="request-row" key={c.id}>
              <MerchantMark candidate={c} size={44} />
              <div className="request-identity">
                <div className="request-name">{c.name}</div>
                <div className="request-meta">
                  {c.category} · {scoreMatch(c).total} match score
                </div>
              </div>
              <div className="request-actions">
                <span className="request-status">Waiting for their reply</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
