import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import CornerBrackets from './CornerBrackets'
import './TermsModal.css'

interface TermsModalProps {
  onClose: () => void
}

interface TermsSection {
  heading: string
  body: string[]
}

const SECTIONS: TermsSection[] = [
  {
    heading: '1. What Connexion is',
    body: [
      'Connexion is a matching service offered to businesses that accept American Express, connecting each merchant with others whose customers already cross-shop nearby. It does not process payments, extend credit, or change any existing card acceptance agreement a merchant holds with American Express.',
    ],
  },
  {
    heading: '2. Who can use it',
    body: [
      'Access is limited to merchants with an active American Express merchant account in good standing. American Express may decline or withdraw access at its discretion, including where a business no longer meets this requirement.',
    ],
  },
  {
    heading: '3. What matching uses, and what it never touches',
    body: [
      'Matching is computed from aggregated customer overlap, sequential visit patterns, and projected uplift, drawn from transactions American Express already processes as card network operator. Other merchants see a resulting score and a plain-language reason for it, never the underlying transactions.',
      "Matching never uses, and no counterpart ever sees: individual transactions, customers, or card numbers; a merchant's revenue figures, margins, or customer lists; or anything at all involving merchants outside Connexion.",
    ],
  },
  {
    heading: '4. Introductions and conduct',
    body: [
      "A merchant's name, category, and trading area are shown to merchants Connexion places them in front of, and the reverse is also true. Contact details are released only once both sides have expressed interest in each other; a one-sided interest is never disclosed to the other party.",
      "Merchants agree to use any introduction made through Connexion for legitimate business purposes, and not to use it to solicit a merchant's customers, employees, or confidential information outside the scope of the proposed partnership.",
    ],
  },
  {
    heading: '5. Consent is specific and revocable',
    body: [
      'Each item a merchant is asked to agree to is presented and recorded separately. Withdrawing consent takes effect immediately, removes the merchant from every active queue, and stops any further matching until consent is given again. Withdrawal does not undo introductions already made before that point.',
    ],
  },
  {
    heading: '6. No guarantee of results',
    body: [
      'Match scores, uplift ranges, and category-gap suggestions are projections based on historical patterns, not a promise of future performance. American Express is not a party to, and takes no responsibility for, any agreement merchants reach with one another as a result of a Connexion introduction.',
    ],
  },
  {
    heading: '7. Changes to these terms',
    body: [
      'These terms may be updated from time to time. Where a change affects what data is used or shared, affected merchants are asked to review and re-confirm consent before matching continues under the new terms.',
    ],
  },
  {
    heading: '8. Questions',
    body: [
      'Reach the Connexion team at support@connexion.example or 1-800-555-0199.',
    ],
  },
]

/**
 * Full text behind the "terms and conditions" checkbox on the consent form.
 * A merchant should never have to take the short summary's word for what
 * they are agreeing to, so the whole thing is reachable in one click rather
 * than a footnote pointing elsewhere.
 */
export default function TermsModal({ onClose }: TermsModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="terms-modal-backdrop" onClick={onClose}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <CornerBrackets />
        <button className="terms-modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="terms-modal-eyebrow">Connexion</div>
        <h2 className="terms-modal-title">Terms and conditions</h2>
        <p className="terms-modal-note">
          Synthetic demo copy for the Connexion prototype, not a real American Express
          merchant agreement.
        </p>

        <div className="terms-modal-body">
          {SECTIONS.map((s) => (
            <section key={s.heading} className="terms-modal-section">
              <h3>{s.heading}</h3>
              {s.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <button className="btn btn-primary terms-modal-done" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  )
}
