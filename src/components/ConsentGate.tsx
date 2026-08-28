import { useState } from 'react'
import CornerBrackets from './CornerBrackets'
import './ConsentGate.css'

interface ConsentGateProps {
  onAccept: () => void
  /** Present when reviewing an existing consent rather than giving it. */
  onCancel?: () => void
  grantedOn?: string | null
  onWithdraw?: () => void
}

interface Clause {
  id: string
  title: string
  detail: string
}

/**
 * The consent form.
 *
 * Matching cannot work without a merchant agreeing to be shown to other
 * merchants, so this is the gate the whole product stands behind rather than a
 * notice to click past. Each clause is agreed to separately, because a single
 * blanket tick is not meaningful consent, and the form stays reachable and
 * revocable afterwards instead of disappearing the moment it is signed.
 */
const CLAUSES: Clause[] = [
  {
    id: 'identity',
    title: 'Show my business to other participating merchants',
    detail:
      'My business name, logo, category and trading area are shown to merchants Connexion puts me in front of, and theirs are shown to me. This is what lets either side recognise the other.',
  },
  {
    id: 'signals',
    title: 'Use my card data to compute a match score',
    detail:
      'Aggregated customer overlap, sequential visit patterns and projected uplift, computed from transactions American Express already processes. Other merchants see the score and the reasons for it, never the underlying figures.',
  },
  {
    id: 'contact',
    title: 'Release my contact details on a mutual match',
    detail:
      'My contact name and email go to a merchant only after we have both liked each other. A like on its own stays private, and nothing is shared with a merchant I have not matched with.',
  },
]

const NEVER = [
  'Individual transactions, customers, or card numbers',
  'My revenue figures, margins, or customer lists',
  'Anything at all with merchants outside Connexion',
]

export default function ConsentGate({
  onAccept,
  onCancel,
  grantedOn,
  onWithdraw,
}: ConsentGateProps) {
  const [agreed, setAgreed] = useState<string[]>(grantedOn ? CLAUSES.map((c) => c.id) : [])
  const complete = agreed.length === CLAUSES.length

  function toggle(id: string) {
    setAgreed((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  }

  return (
    <div className="consent-gate">
      <CornerBrackets />
      <div className="consent-eyebrow">
        {grantedOn ? 'Your data sharing consent' : 'Consent required'}
      </div>
      <h2 className="consent-title">
        {grantedOn ? 'What you agreed to share' : 'Before Connexion can match you'}
      </h2>
      <p className="consent-intro">
        Matching means showing your business to merchants you have not met, and
        showing theirs to you. That cannot happen without your agreement, so
        nothing below is on until you switch it on, and you can withdraw it at any
        time.
      </p>

      <div className="consent-required">
        <span className="consent-required-count">
          {agreed.length} of {CLAUSES.length} agreed
        </span>
        <span className="consent-required-note">
          All three are required. Matching cannot run on a partial agreement, so
          leaving any one unticked means your business is not listed and no
          merchant is shown to you.
        </span>
      </div>

      <div className="consent-clauses">
        {CLAUSES.map((c, i) => {
          const on = agreed.includes(c.id)
          return (
            <label
              key={c.id}
              className={`consent-clause ${on ? 'is-agreed' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(c.id)} />
              <span className="consent-clause-body">
                <span className="consent-clause-title">{c.title}</span>
                <span className="consent-clause-detail">{c.detail}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="consent-never">
        <div className="consent-never-label">Never shared, with anyone</div>
        <ul>
          {NEVER.map((n) => (
            <li key={n}>
              <span className="consent-never-mark">×</span>
              {n}
            </li>
          ))}
        </ul>
      </div>

      <div className="consent-actions">
        {grantedOn ? (
          <>
            <button className="btn btn-primary" onClick={onCancel}>
              Back to matching
            </button>
            <button className="btn btn-ghost" onClick={onWithdraw}>
              Withdraw consent
            </button>
            <span className="consent-footnote">
              Given on {grantedOn}. Withdrawing removes your business from every
              queue it appears in.
            </span>
          </>
        ) : (
          <>
            <button className="btn btn-primary" disabled={!complete} onClick={onAccept}>
              {complete
                ? 'Agree and start matching'
                : `${CLAUSES.length - agreed.length} left to agree`}
            </button>
            <span className="consent-footnote">
              {complete
                ? "Consent is per merchant and revocable. No data leaves American Express's closed loop."
                : 'You cannot take part in matching until all three are agreed.'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
