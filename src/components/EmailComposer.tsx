import { useState } from 'react'
import type { OutreachEmail } from '../utils/outreachEmails'
import './EmailComposer.css'

interface EmailComposerProps {
  email: OutreachEmail
  /** Label for the send action, e.g. "Send to 4 merchants". */
  sendLabel: string
  /** Line shown once sent. */
  sentLabel: string
  /** Extra recipients listed above the email, for a bulk dispatch. */
  recipients?: { name: string; email: string }[]
}

/**
 * Composed outreach, ready to go out.
 *
 * Sending is simulated: this is a prototype with synthetic merchants on a
 * reserved .example domain, so nothing can leave the browser. The copy on the
 * confirmation says as much rather than implying mail was delivered.
 */
export default function EmailComposer({
  email,
  sendLabel,
  sentLabel,
  recipients,
}: EmailComposerProps) {
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="composer">
      <div className="composer-head">
        <div>
          <div className="composer-label">Drafted by Connexion</div>
          <div className="composer-from">
            {email.fromName}, {email.fromRole}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="composer-fields">
        <div className="composer-field">
          <span className="composer-key">From</span>
          <span className="composer-val">{email.fromEmail}</span>
        </div>
        <div className="composer-field">
          <span className="composer-key">To</span>
          <span className="composer-val">
            {recipients ? (
              <span className="composer-recipients">
                {recipients.map((r) => (
                  <span className="recipient-chip" key={r.email}>
                    {r.name}
                  </span>
                ))}
              </span>
            ) : (
              `${email.to.name}, ${email.to.role} · ${email.to.email}`
            )}
          </span>
        </div>
        <div className="composer-field">
          <span className="composer-key">Subject</span>
          <span className="composer-val composer-subject">{email.subject}</span>
        </div>
      </div>

      <pre className="composer-body">{email.body}</pre>

      <div className="composer-actions">
        <button
          className={`btn btn-primary composer-send ${sent ? 'is-sent' : ''}`}
          onClick={() => setSent(true)}
          disabled={sent}
        >
          {sent ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {sentLabel}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              {sendLabel}
            </>
          )}
        </button>
        <span className="composer-note">
          Prototype: addresses use the reserved .example domain and nothing leaves
          the browser. Edit before sending for real.
        </span>
      </div>
    </div>
  )
}
