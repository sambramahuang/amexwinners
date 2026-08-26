import { useState } from 'react'
import {
  PERSONALITY_QUESTIONS,
  buildPersonalityProfile,
  type PersonalityAnswer,
  type PersonalityProfile,
} from '../data/personalityQuiz'
import CornerBrackets from './CornerBrackets'
import './PersonalityQuiz.css'

interface PersonalityQuizProps {
  onComplete: (profile: PersonalityProfile) => void
  onSkip: () => void
}

export default function PersonalityQuiz({ onComplete, onSkip }: PersonalityQuizProps) {
  const [selections, setSelections] = useState<Record<string, number>>({})

  const answeredCount = Object.keys(selections).length
  const allAnswered = answeredCount === PERSONALITY_QUESTIONS.length

  function pick(questionId: string, optionIndex: number) {
    setSelections((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  function submit() {
    const answers: PersonalityAnswer[] = PERSONALITY_QUESTIONS.map((q) => {
      const option = q.options[selections[q.id]]
      return { questionId: q.id, prompt: q.prompt, label: option.label, kind: q.kind, tags: option.tags }
    })
    onComplete(buildPersonalityProfile(answers))
  }

  return (
    <div className="personality-quiz">
      <CornerBrackets />
      <div className="personality-quiz-eyebrow">Optional · sharpens ranking, doesn't replace it</div>
      <h2 className="personality-quiz-title">Basin's partnership profile</h2>
      <p className="personality-quiz-intro">
        A short questionnaire on how Basin evaluates potential partners — used only to refine ranking
        and add context to the matches below. The underlying scores stay driven by real Amex
        closed-loop transaction data; this just breaks ties and adds color to the explanation.
      </p>

      <div className="personality-quiz-questions">
        {PERSONALITY_QUESTIONS.map((q) => (
          <div className="personality-question" key={q.id}>
            <div className="personality-question-prompt">{q.prompt}</div>
            <div className="personality-question-options">
              {q.options.map((option, i) => (
                <button
                  key={option.label}
                  type="button"
                  className={`personality-option ${selections[q.id] === i ? 'is-selected' : ''}`}
                  onClick={() => pick(q.id, i)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="personality-quiz-actions">
        <button className="btn btn-ghost" onClick={onSkip}>
          Skip — use transaction data only
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={!allAnswered}>
          Apply to ranking ({answeredCount}/{PERSONALITY_QUESTIONS.length})
        </button>
      </div>
    </div>
  )
}
