/**
 * MultipleChoiceSection.tsx
 * Renders all 10 MC questions, collects answers, shows results after submit.
 */

'use client'

import { useState } from 'react'
import { MultipleChoiceQuestion, MultipleChoiceAnswer } from '@/lib/types'
import Button from './Button'

interface Props {
  questions: MultipleChoiceQuestion[]
  onComplete: (answers: MultipleChoiceAnswer[]) => void
}

type Phase = 'taking' | 'reviewing'

export default function MultipleChoiceSection({ questions, onComplete }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('taking')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const answeredCount = Object.keys(selected).length
  const allAnswered = answeredCount === questions.length

  function handleSelect(questionId: string, option: string) {
    if (phase === 'reviewing') return
    setSelected(prev => ({ ...prev, [questionId]: option }))
    setSubmitError(null)
  }

  function handleSubmit() {
    if (!allAnswered) {
      setSubmitError(`Please answer all questions. (${answeredCount}/${questions.length} answered)`)
      return
    }
    const answers: MultipleChoiceAnswer[] = questions.map(q => ({
      questionId: q.id,
      selectedOption: selected[q.id],
      isCorrect: selected[q.id] === q.correctAnswer,
    }))
    setPhase('reviewing')
    onComplete(answers)
  }

  const score = phase === 'reviewing'
    ? questions.filter(q => selected[q.id] === q.correctAnswer).length
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Part 1 — Multiple Choice
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {phase === 'taking'
              ? `${answeredCount} of ${questions.length} answered`
              : `Score: ${score} / ${questions.length}`}
          </p>
        </div>
        {phase === 'reviewing' && score !== null && (
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
            score >= 8 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : score >= 6 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {score}/10
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = selected[q.id]
          const isCorrect = userAnswer === q.correctAnswer
          const wasAnswered = !!userAnswer

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 ${
                phase === 'reviewing'
                  ? isCorrect
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : wasAnswered
                  ? 'border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  <span className="text-brand-600 dark:text-brand-400 font-semibold mr-2">Q{index + 1}.</span>
                  {q.question}
                </p>
                <span className="shrink-0 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {q.topic}
                </span>
              </div>

              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const letters = ['A', 'B', 'C', 'D']
                  const isSelected = userAnswer === option
                  const isCorrectOption = option === q.correctAnswer

                  let optionStyle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'

                  if (phase === 'reviewing') {
                    if (isCorrectOption) {
                      optionStyle = 'border-green-400 dark:border-green-600 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-medium'
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 line-through'
                    } else {
                      optionStyle = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-brand-500 dark:border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200 font-medium'
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, option)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-colors ${optionStyle} ${
                        phase === 'reviewing' ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span className="shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                        {letters[optIdx]}
                      </span>
                      {option}
                    </button>
                  )
                })}
              </div>

              {phase === 'reviewing' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {phase === 'taking' && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{answeredCount}/{questions.length} answered</p>
          <div className="flex flex-col items-end gap-2">
            {submitError && <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>}
            <Button onClick={handleSubmit} size="lg">
              Submit Multiple Choice →
            </Button>
          </div>
        </div>
      )}

      {phase === 'reviewing' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          ✓ Multiple choice complete! Scroll down to attempt the short answer questions.
        </div>
      )}
    </div>
  )
}
