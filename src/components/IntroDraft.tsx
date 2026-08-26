import { useState } from 'react'
import type { MatchCandidate } from '../data/graphEngineData'
import type { MatchScore } from '../utils/circuitScore'
import './IntroDraft.css'

const ANCHOR = {
  name: 'Basin Coffee Roasters',
  category: 'café',
  region: 'Downtown Loop',
  contact: { name: 'Rae Halloran', role: 'Owner', email: 'rae@basincoffee.example' },
}

interface IntroDraftProps {
  candidate: MatchCandidate
  score: MatchScore
}

// A first step the two businesses could actually run. Their suggested terms are
// already written per candidate, so the draft uses those rather than inventing
// a generic partnership line.
function firstStep(candidate: MatchCandidate) {
  if (candidate.terms.toLowerCase().startsWith('no proposal')) {
    return 'The signal between us is still thin, so rather than propose terms up front I would rather compare notes and see whether anything obvious falls out.'
  }
  return `Circuit suggests a concrete first step: ${candidate.terms.charAt(0).toLowerCase()}${candidate.terms.slice(1)}`
}

export function buildIntroEmail(candidate: MatchCandidate, score: MatchScore) {
  const reasons = score.tags.map((t) => t.toLowerCase()).join(', ')
  const subject = `Partnership idea: ${ANCHOR.name} and ${candidate.name}`
  const body = [
    `Hi ${candidate.contact.name.split(' ')[0]},`,
    '',
    `I run ${ANCHOR.name}, the ${ANCHOR.category} in ${ANCHOR.region}. Circuit matched our two businesses at ${score.total.toFixed(1)} out of 10, and we have both pressed connect, so I thought I would reach out directly.`,
    '',
    `Circuit put the score down to ${reasons}. ${firstStep(candidate)}`,
    '',
    'Would you be open to a short call next week to see whether it is worth trying?',
    '',
    'Best,',
    ANCHOR.contact.name,
    `${ANCHOR.contact.role}, ${ANCHOR.name}`,
    ANCHOR.contact.email,
  ].join('\n')

  return { to: candidate.contact, subject, body }
}

/**
 * The draft is handed over, never sent.
 *
 * A mutual match is where most matchmaking stalls: both sides agree and then
 * wait for the other to write first. Circuit writes the opening message,
 * grounded in the same score the merchant just read.
 */
export default function IntroDraft({ candidate, score }: IntroDraftProps) {
  const { to, subject, body } = buildIntroEmail(candidate, score)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="intro-draft">
      <div className="intro-draft-head">
        <div>
          <div className="intro-draft-label">Drafted by Circuit</div>
          <div className="intro-draft-to">Your introduction to {to.name}</div>
          <div className="intro-draft-meta">
            {to.role}, {candidate.name} · {to.email}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={copy}>
          {copied ? 'Copied' : 'Copy draft'}
        </button>
      </div>

      <div className="intro-draft-body">
        <div className="intro-draft-subject">Subject: {subject}</div>
        <pre className="intro-draft-text">{body}</pre>
      </div>

      <p className="intro-draft-note">
        Contact details are released only after both merchants connect, and nothing
        is sent on your behalf. Edit anything before sending. This contact and
        address are illustrative.
      </p>
    </div>
  )
}
