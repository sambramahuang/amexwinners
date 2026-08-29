import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ProspectTarget } from '../data/graphEngineData'
import { prospectScoreBand, scoreProspectBreakdown } from '../utils/prospectScore'
import CornerBrackets from './CornerBrackets'
import './ProspectAnalysisModal.css'

interface ProspectAnalysisModalProps {
  prospect: ProspectTarget
  onClose: () => void
}

export default function ProspectAnalysisModal({ prospect, onClose }: ProspectAnalysisModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const { total, factors } = scoreProspectBreakdown(prospect)

  return createPortal(
    <div className="analysis-modal-backdrop" onClick={onClose}>
      <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
        <CornerBrackets />
        <button className="analysis-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="analysis-modal-eyebrow">Why acquire this merchant</div>
        <div className="analysis-modal-title">{prospect.name}</div>
        <div className="analysis-modal-meta">
          {prospect.category} · {prospect.cluster}
        </div>

        <div className="analysis-modal-verdict">
          <span className="analysis-modal-score">{total}</span>
          <div>
            <div className="analysis-modal-band">{prospectScoreBand(total)}</div>
            <div className="analysis-modal-band-caption">out of 100, Amex fit score</div>
          </div>
        </div>

        <p className="analysis-modal-reasoning">{prospect.reasoning}</p>

        <div className="analysis-modal-section">
          <div className="analysis-modal-section-label">How this score was built</div>
          {factors.map((f) => (
            <div className="analysis-factor" key={f.key}>
              <div className="analysis-factor-head">
                <span className="analysis-factor-label">
                  {f.label}
                  <span className="analysis-factor-weight">weight {Math.round(f.weight * 100)}%</span>
                </span>
                <span className="analysis-factor-value">{f.value}</span>
              </div>
              <div className="analysis-factor-track">
                <div className="analysis-factor-fill" style={{ width: `${f.value}%` }} />
              </div>
              <p className="analysis-factor-detail">{f.detail}</p>
            </div>
          ))}
        </div>

        <div className="analysis-modal-section analysis-modal-waiting-section">
          <div className="analysis-modal-section-label">Merchants already waiting</div>
          <ul className="analysis-modal-waiting-list">
            {prospect.waiting.map((w) => (
              <li key={w.name}>
                <strong>{w.name}</strong> — {w.why}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  )
}
