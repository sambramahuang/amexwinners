import { useState } from 'react'
import CornerBrackets from './CornerBrackets'
import './ConsentGate.css'

interface ConsentGateProps {
  onAccept: () => void
}

interface ShareRowProps {
  shared?: boolean
  children: React.ReactNode
}

function ShareRow({ shared = false, children }: ShareRowProps) {
  return (
    <li className="consent-row">
      <span className={`consent-mark ${shared ? 'is-shared' : 'is-withheld'}`}>
        {shared ? '✓' : '×'}
      </span>
      <span>{children}</span>
    </li>
  )
}

/**
 * Matching is off until the merchant turns it on.
 *
 * The gate is itemised rather than a single checkbox because the point being
 * demonstrated is that a merchant can see exactly which signals leave their
 * business before any of them do.
 */
export default function ConsentGate({ onAccept }: ConsentGateProps) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="consent-gate">
      <CornerBrackets />
      <div className="consent-eyebrow">Opt in required</div>
      <h2 className="consent-title">Turn on matching for Basin Coffee Roasters</h2>
      <p className="consent-intro">
        Matching is off by default. Switching it on lists Basin to complementary
        merchants in the graph, and them to Basin, with a match score standing in
        for the transaction data behind it.
      </p>

      <ul className="consent-list">
        <ShareRow shared>Your business name, trading area and category</ShareRow>
        <ShareRow shared>
          A match score out of 10, computed from closed-loop transaction data and
          shown with the reasons behind it
        </ShareRow>
        <ShareRow>
          The figures behind that score: customer overlap, projected uplift, spend
          patterns
        </ShareRow>
        <ShareRow>
          Your contact details, released only when both merchants connect
        </ShareRow>
        <ShareRow>Individual transactions, customers, or card numbers: never</ShareRow>
      </ul>

      <label className="consent-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>
          I consent to listing Basin to matched merchants on these terms. Matching
          can be switched off at any time, which removes Basin from the queue.
        </span>
      </label>

      <div className="consent-actions">
        <button className="btn btn-primary" disabled={!checked} onClick={onAccept}>
          Turn on matching
        </button>
        <span className="consent-footnote">
          Consent is per merchant and revocable. No data leaves Amex's closed loop.
        </span>
      </div>
    </div>
  )
}
