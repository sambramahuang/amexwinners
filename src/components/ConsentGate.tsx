import { useState } from 'react'
import CornerBrackets from './CornerBrackets'
import './ConsentGate.css'

interface ConsentGateProps {
  onAccept: () => void
  /** SME view: the merchant is consenting for their own business. */
  hideIdentity?: boolean
}

function ShareRow({ shared = false, children }: { shared?: boolean; children: React.ReactNode }) {
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
 * Itemised rather than a single checkbox, because the thing being demonstrated
 * is that a merchant can see exactly which signals leave their business before
 * any of them do.
 */
export default function ConsentGate({ onAccept, hideIdentity = false }: ConsentGateProps) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="consent-gate">
      <CornerBrackets />
      <div className="consent-eyebrow">Opt in required</div>
      <h2 className="consent-title">Turn on matching for Basin Coffee Roasters</h2>
      <p className="consent-intro">
        Matching is off by default. Switching it on places Basin in the graph
        alongside complementary merchants, and shows those merchants to Basin,
        using signals derived from card transactions Amex already processes.
      </p>

      <ul className="consent-list">
        <ShareRow shared>Your category, trading area and hours</ShareRow>
        <ShareRow shared>
          Customer overlap and sequential visit patterns, aggregated across your
          whole customer base
        </ShareRow>
        <ShareRow shared>A projected uplift range and a value symmetry check</ShareRow>
        <ShareRow>
          {hideIdentity
            ? 'Your business name, released to a candidate only once you both match'
            : 'Your business name, released only once both merchants match'}
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
          I consent to Basin being matched on these terms. Matching can be switched
          off at any time, which removes Basin from every queue it appears in.
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
