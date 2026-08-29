import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ProspectTarget } from '../data/graphEngineData'
import { buildRecruitEmail } from '../utils/outreachEmails'
import CornerBrackets from './CornerBrackets'
import EmailComposer from './EmailComposer'
import './PitchModal.css'

interface PitchModalProps {
  prospect: ProspectTarget
  onClose: () => void
}

export default function PitchModal({ prospect, onClose }: PitchModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="pitch-modal-backdrop" onClick={onClose}>
      <div className="pitch-modal" onClick={(e) => e.stopPropagation()}>
        <CornerBrackets />
        <button className="pitch-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="pitch-modal-eyebrow">Recruit pitch</div>
        <div className="pitch-modal-title">{prospect.name}</div>
        <div className="pitch-modal-meta">
          {prospect.category} · {prospect.cluster}
        </div>

        <div className="pitch-modal-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Projected. A category benchmark, not computed from live data.
        </div>

        <p className="pitch-modal-copy">{prospect.pitchCopy}</p>

        <div className="pitch-modal-section pitch-modal-email-section">
          <div className="pitch-modal-section-label">Recommended email</div>
          <EmailComposer
            email={buildRecruitEmail(prospect)}
            sendLabel={`Send to ${prospect.contact.name.split(' ')[0]}`}
            sentLabel="Sent"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
