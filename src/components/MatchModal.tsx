import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TIER_LABELS, type MatchCandidate } from '../data/graphEngineData'
import type { PersonalityProfile } from '../data/personalityQuiz'
import CornerBrackets from './CornerBrackets'
import { BenefitBarChart, UpliftTrendChart } from './BenefitCharts'
import './MatchModal.css'

interface MatchModalProps {
  candidate: MatchCandidate
  personalityProfile: PersonalityProfile | null
  onClose: () => void
  mode?: 'match' | 'preview'
}

const ANCHOR = { name: 'Basin Coffee Roasters', category: 'Café' }

export default function MatchModal({ candidate, personalityProfile, onClose, mode = 'match' }: MatchModalProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setExplanation(null)

    const personality = personalityProfile
      ? personalityProfile.answers.map((a) => ({ question: a.prompt, answer: a.label }))
      : null

    fetch('/api/explain-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anchor: ANCHOR, candidate, personality }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setExplanation(data.explanation)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [candidate, personalityProfile])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
          Basin Coffee Roasters × {candidate.name}
        </div>
        <p className="match-modal-note">{candidate.balanceNote}</p>

        <div className="match-modal-tier">
          <span className={`tier-badge tier-badge-${candidate.tier}`}>{TIER_LABELS[candidate.tier]}</span>
          <span className="match-modal-tier-months">{candidate.monthsActive} mo. active</span>
        </div>
        <p className="match-modal-tier-rationale">{candidate.tierRationale}</p>

        <div className="match-modal-section">
          <div className="match-modal-section-label">Predicted benefits</div>
          <BenefitBarChart
            youLabel="Basin"
            themLabel={candidate.shortName}
            youValue={candidate.upliftYou}
            themValue={candidate.upliftThem}
          />
        </div>

        <div className="match-modal-section">
          <div className="match-modal-section-label">Projected ramp, first 6 months</div>
          <UpliftTrendChart
            youLabel="Basin"
            themLabel={candidate.shortName}
            youValue={candidate.upliftYou}
            themValue={candidate.upliftThem}
          />
        </div>

        {candidate.tier === 3 && candidate.tier3Suggestion && (
          <div className="match-modal-tier3">
            <div className="match-modal-tier3-label">Structural relationship — starter suggestion</div>
            <p>{candidate.tier3Suggestion}</p>
            <p className="match-modal-tier3-disclaimer">
              A non-binding starting point — the merchants handle the actual arrangement themselves.
            </p>
          </div>
        )}

        <div className="match-modal-ai">
          <div className="match-modal-ai-label">
            AI explainability layer{personalityProfile && ' · transaction data + Basin’s partnership profile'}
          </div>
          {status === 'loading' && <p className="match-modal-ai-loading">Generating explanation…</p>}
          {status === 'ready' && <p>{explanation}</p>}
          {status === 'error' && <p>{candidate.sequential}</p>}
        </div>

        <div className="match-modal-terms">Suggested terms: {candidate.terms}</div>
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
