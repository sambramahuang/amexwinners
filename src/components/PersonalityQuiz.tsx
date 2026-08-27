import { useState } from 'react'
import {
  BRAND_WORDS,
  WORDS_REQUIRED,
  buildProfileFromWords,
  type BrandWord,
  type PersonalityProfile,
} from '../data/personalityQuiz'
import CornerBrackets from './CornerBrackets'
import './PersonalityQuiz.css'

interface PersonalityQuizProps {
  onComplete: (profile: PersonalityProfile) => void
  onSkip: () => void
}

/**
 * Three words for the business, picked rather than typed.
 *
 * Self-reported and deliberately light. It nudges ranking by up to 30% and
 * colours the explanation; the closed-loop transaction data still leads.
 */
export default function PersonalityQuiz({ onComplete, onSkip }: PersonalityQuizProps) {
  const [picked, setPicked] = useState<BrandWord[]>([])

  const full = picked.length >= WORDS_REQUIRED
  const indexOf = (w: BrandWord) => picked.findIndex((p) => p.word === w.word)

  function toggle(word: BrandWord) {
    const at = indexOf(word)
    if (at >= 0) setPicked((p) => p.filter((_, i) => i !== at))
    else if (!full) setPicked((p) => [...p, word])
  }

  return (
    <div className="quiz">
      <CornerBrackets />

      <div className="quiz-head">
        <div className="quiz-eyebrow">Optional, 10 seconds</div>
        <h2 className="quiz-title">Pick three words for Basin Coffee Roasters</h2>
        <p className="quiz-sub">
          How the business actually feels to a customer. We use it to break ties
          between candidates the transaction data rates equally.
        </p>
      </div>

      <div className="quiz-progress" aria-hidden="true">
        {Array.from({ length: WORDS_REQUIRED }, (_, i) => (
          <span
            key={i}
            className={`quiz-pip ${i < picked.length ? 'is-filled' : ''}`}
          >
            {i < picked.length ? picked[i].word : ''}
          </span>
        ))}
      </div>

      <div className={`quiz-words ${full ? 'is-full' : ''}`}>
        {BRAND_WORDS.map((w, i) => {
          const at = indexOf(w)
          const selected = at >= 0
          return (
            <button
              key={w.word}
              type="button"
              onClick={() => toggle(w)}
              disabled={!selected && full}
              className={`word-chip ${selected ? 'is-selected' : ''}`}
              style={{ animationDelay: `${i * 26}ms` }}
              aria-pressed={selected}
            >
              {selected && <span className="word-chip-order">{at + 1}</span>}
              <span className="word-chip-word">{w.word}</span>
              <span className="word-chip-meaning">{w.meaning}</span>
            </button>
          )
        })}
      </div>

      <div className="quiz-actions">
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip, use transaction data only
        </button>
        <button
          className="btn btn-primary"
          disabled={!full}
          onClick={() => onComplete(buildProfileFromWords(picked))}
        >
          {full ? 'Apply to ranking' : `Pick ${WORDS_REQUIRED - picked.length} more`}
        </button>
      </div>
    </div>
  )
}
