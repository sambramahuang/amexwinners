import { useState } from 'react'
import { GOAL_LABELS, type PartnershipGoal } from '../data/graphEngineData'
import CornerBrackets from './CornerBrackets'
import './PreferencesStep.css'

interface PreferencesStepProps {
  onDone: (goals: PartnershipGoal[]) => void
  onSkip: () => void
  initial?: PartnershipGoal[]
}

const ORDER: PartnershipGoal[] = [
  'cross-industry',
  'long-term',
  'new-demographic',
  'same-industry',
]

const DETAIL: Record<PartnershipGoal, string> = {
  'cross-industry':
    'A business in a different trade whose customers overlap with yours. The most common shape, and usually the easiest to run.',
  'long-term':
    'Something that outlasts a single offer. These merchants have held a partnership for months rather than weeks.',
  'new-demographic':
    'A merchant whose customers are not already yours, to put your business in front of people who have not found it.',
  'same-industry':
    'Another merchant in your trade. Not a competitor if the hours or the catchment differ, and often the fastest to agree terms.',
}

/**
 * What the merchant is looking for, asked once after consent.
 *
 * This reorders the queue; it does not score. The transaction data decides how
 * good a match is, and this decides which of the good ones to show first, so a
 * merchant who wants a different trade is not handed their own trade at the top.
 */
export default function PreferencesStep({ onDone, onSkip, initial = [] }: PreferencesStepProps) {
  const [picked, setPicked] = useState<PartnershipGoal[]>(initial)

  function toggle(goal: PartnershipGoal) {
    setPicked((p) => (p.includes(goal) ? p.filter((g) => g !== goal) : [...p, goal]))
  }

  return (
    <div className="prefs">
      <CornerBrackets />
      <div className="prefs-eyebrow">One question, then the queue</div>
      <h2 className="prefs-title">What are you looking for?</h2>
      <p className="prefs-intro">
        Pick as many as apply. This changes the order merchants are shown in, not
        how they are scored, and you can change it at any time.
      </p>

      <div className="prefs-options">
        {ORDER.map((goal, i) => {
          const on = picked.includes(goal)
          return (
            <label
              key={goal}
              className={`prefs-option ${on ? 'is-picked' : ''}`}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(goal)} />
              <span className="prefs-option-body">
                <span className="prefs-option-title">{GOAL_LABELS[goal]}</span>
                <span className="prefs-option-detail">{DETAIL[goal]}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="prefs-actions">
        <button className="btn btn-primary" disabled={picked.length === 0} onClick={() => onDone(picked)}>
          {picked.length === 0
            ? 'Pick at least one'
            : `Show me ${picked.length === 1 ? 'these' : 'these'} matches`}
        </button>
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip, show everything
        </button>
      </div>
    </div>
  )
}
