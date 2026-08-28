import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TIER_LABELS, type MatchCandidate } from '../data/graphEngineData'
import { redactCandidateName } from '../utils/redactCandidateName'
import EmailComposer from './EmailComposer'
import { buildMatchIntroEmail, buildMerchantIntroEmail } from '../utils/outreachEmails'
import CornerBrackets from './CornerBrackets'
import { BenefitBarChart, UpliftTrendChart } from './BenefitCharts'
import './MatchModal.css'

interface MatchModalProps {
  candidate: MatchCandidate
  onClose: () => void
  mode?: 'match' | 'preview'
  /** True pre-match — hides the counterpart's identity from another SME, keeping only its category. */
  hideIdentity?: boolean
  /** SME view: the introduction is written by the merchant, not by Amex. */
  smeVoice?: boolean
}

export default function MatchModal({
  candidate,
  onClose,
  mode = 'match',
  hideIdentity = false,
  smeVoice = false,
}: MatchModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const [compose, setCompose] = useState(false)
  const displayName = hideIdentity ? candidate.category : candidate.name
  const displayShortName = hideIdentity ? candidate.category : candidate.shortName
  const redact = (text: string) => (hideIdentity ? redactCandidateName(text, candidate) : text)

  return createPortal(
    <div className="match-modal-backdrop" onClick={onClose}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>
        <CornerBrackets />
        <button className="match-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="match-modal-eyebrow">{mode === 'preview' ? "Amex's proposal" : "It's a match"}</div>
        <div className="match-modal-title">
          Basin Coffee Roasters × {displayName}
        </div>
        <p className="match-modal-note">{redact(candidate.balanceNote)}</p>

        <div className="match-modal-tier">
          <span className={`tier-badge tier-badge-${candidate.tier}`}>{TIER_LABELS[candidate.tier]}</span>
          <span className="match-modal-tier-months">{candidate.monthsActive} mo. active</span>
        </div>
        <p className="match-modal-tier-rationale">{redact(candidate.tierRationale)}</p>

        <div className="match-modal-section">
          <div className="match-modal-section-label">Predicted benefits</div>
          <BenefitBarChart
            youLabel="Basin"
            themLabel={displayShortName}
            youValue={candidate.upliftYou}
            themValue={candidate.upliftThem}
          />
        </div>

        <div className="match-modal-section">
          <div className="match-modal-section-label">Projected ramp, first 6 months</div>
          <UpliftTrendChart
            youLabel="Basin"
            themLabel={displayShortName}
            youValue={candidate.upliftYou}
            themValue={candidate.upliftThem}
          />
        </div>

        {candidate.tier === 3 && candidate.tier3Suggestion && (
          <div className="match-modal-tier3">
            <div className="match-modal-tier3-label">Structural relationship — starter suggestion</div>
            <p>{redact(candidate.tier3Suggestion)}</p>
            <p className="match-modal-tier3-disclaimer">
              A non-binding starting point — the merchants handle the actual arrangement themselves.
            </p>
          </div>
        )}

        <div className="match-modal-ai">
          <div className="match-modal-ai-label">
            AI explainability layer
          </div>
          <p>{redact(candidate.sequential)}</p>
        </div>

        <div className="match-modal-terms">Suggested terms: {redact(candidate.terms)}</div>
        <div className="match-modal-outreach">
          {compose ? (
            <EmailComposer
              email={
                smeVoice ? buildMerchantIntroEmail(candidate) : buildMatchIntroEmail(candidate)
              }
              sendLabel={`Send to ${candidate.contact.name.split(' ')[0]}`}
              sentLabel="Sent"
            />
          ) : (
            <button className="btn btn-primary match-modal-compose" onClick={() => setCompose(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
              {smeVoice ? 'Write to them' : 'Write the introduction'}
            </button>
          )}
        </div>

        <div className="match-modal-actions">
          {mode === 'preview' ? (
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onClose}>
                Keep reviewing
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Add to pipeline
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
