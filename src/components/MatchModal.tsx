import { useEffect, useState } from 'react'
import type { MatchCandidate } from '../data/graphEngineData'
import type { PersonalityProfile } from '../data/personalityQuiz'
import type { MatchScore } from '../utils/circuitScore'
import CornerBrackets from './CornerBrackets'
import IntroDraft from './IntroDraft'
import './MatchModal.css'

interface MatchModalProps {
  candidate: MatchCandidate
  personalityProfile: PersonalityProfile | null
  /** Present on a mutual match, which is the only time the draft is released. */
  score?: MatchScore
  onClose: () => void
}

const ANCHOR = { name: 'Basin Coffee Roasters', category: 'Café' }

export default function MatchModal({ candidate, personalityProfile, score, onClose }: MatchModalProps) {
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

  return (
    <div className="match-modal-backdrop">
      <div className="match-modal">
        <CornerBrackets />
        <div className="match-modal-eyebrow">It's a match</div>
        <div className="match-modal-title">
          Basin Coffee Roasters × {candidate.name}
        </div>
        <p className="match-modal-mutual">
          {candidate.name} had already connected with Basin, so both sides have now
          agreed. Contact details are released to each of you.
        </p>
        <p className="match-modal-note">{candidate.balanceNote}</p>

        <div className="match-modal-ai">
          <div className="match-modal-ai-label">
            AI explainability layer{personalityProfile && ' · transaction data + Basin’s partnership profile'}
          </div>
          {status === 'loading' && <p className="match-modal-ai-loading">Generating explanation…</p>}
          {status === 'ready' && <p>{explanation}</p>}
          {status === 'error' && <p>{candidate.sequential}</p>}
        </div>

        <div className="match-modal-terms">Suggested terms: {candidate.terms}</div>

        {score && <IntroDraft candidate={candidate} score={score} />}
        <div className="match-modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Keep reviewing
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Save to requests
          </button>
        </div>
      </div>
    </div>
  )
}
