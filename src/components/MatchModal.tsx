import type { MatchCandidate } from '../data/graphEngineData'
import CornerBrackets from './CornerBrackets'
import './MatchModal.css'

interface MatchModalProps {
  candidate: MatchCandidate
  onClose: () => void
}

export default function MatchModal({ candidate, onClose }: MatchModalProps) {
  return (
    <div className="match-modal-backdrop">
      <div className="match-modal">
        <CornerBrackets />
        <div className="match-modal-eyebrow">It's a match</div>
        <div className="match-modal-title">
          Basin Coffee Roasters × {candidate.name}
        </div>
        <p className="match-modal-note">{candidate.balanceNote}</p>
        <div className="match-modal-terms">Suggested terms: {candidate.terms}</div>
        <div className="match-modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Keep reviewing
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Add to pipeline
          </button>
        </div>
      </div>
    </div>
  )
}
