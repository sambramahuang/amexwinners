import { useEffect, useRef, useState } from 'react'
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
 * Composed outreach, ready to edit and then go.
 *
 * Connexion writes the first draft because a blank page is where most
 * introductions die, but the merchant sends it, so subject and body are theirs
 * to change before it goes. Sending is simulated: this is a prototype with
 * synthetic merchants on a reserved .example domain, so nothing leaves the
 * browser, and the confirmation says so rather than implying delivery.
 */
export default function EmailComposer({
  email,
  sendLabel,
  sentLabel,
  recipients,
}: EmailComposerProps) {
  const [subject, setSubject] = useState(email.subject)
  const [body, setBody] = useState(email.body)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // A different candidate means a different draft.
  useEffect(() => {
    setSubject(email.subject)
    setBody(email.body)
    setSent(false)
  }, [email.subject, email.body])

  // Grow to the text rather than making the merchant scroll a small box.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [body])

  const edited = subject !== email.subject || body !== email.body

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function reset() {
    setSubject(email.subject)
    setBody(email.body)
  }

  return (
    <div className="composer">
      <div className="composer-head">
        <div>
          <div className="composer-label">
            {edited ? 'Drafted by Connexion, edited by you' : 'Drafted by Connexion'}
          </div>
          <div className="composer-from">
            {email.fromName}, {email.fromRole}
          </div>
        </div>
        <div className="composer-head-actions">
          {edited && (
            <button className="btn btn-ghost" onClick={reset}>
              Reset draft
            </button>
          )}
          <button className="btn btn-ghost" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
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
        <label className="composer-field">
          <span className="composer-key">Subject</span>
          <input
            className="composer-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sent}
          />
        </label>
      </div>

      <textarea
        ref={bodyRef}
        className="composer-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={sent}
        spellCheck
        aria-label="Message body"
      />

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
          Edit anything above before you send. Prototype: addresses use the
          reserved .example domain and nothing leaves the browser.
        </span>
      </div>
    </div>
  )
}
