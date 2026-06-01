/**
 * ShortAnswerSection.tsx — with dark mode classes.
 */

'use client'

import { useState } from 'react'
import { ShortAnswerQuestion, ShortAnswerResponse } from '@/lib/types'
import Button from './Button'

interface Props {
  questions: ShortAnswerQuestion[]
  onComplete: (responses: ShortAnswerResponse[]) => void
}

type QuestionState = {
  userAnswer: string
  revealed: boolean
  selfGraded: boolean | null
}

export default function ShortAnswerSection({ questions, onComplete }: Props) {
  const [states, setStates] = useState<Record<string, QuestionState>>(
    Object.fromEntries(
      questions.map(q => [q.id, { userAnswer: '', revealed: false, selfGraded: null }])
    )
  )
  const [submitted, setSubmitted] = useState(false)

  function updateState(id: string, patch: Partial<QuestionState>) {
    setStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const allGraded = questions.every(q => states[q.id].selfGraded !== null)

  function handleFinish() {
    const responses: ShortAnswerResponse[] = questions.map(q => ({
      questionId: q.id,
      userAnswer: states[q.id].userAnswer,
      selfGraded: states[q.id].selfGraded,
    }))
    setSubmitted(true)
    onComplete(responses)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Part 2 — Short Answer</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Write your answer, then reveal the model answer to self-grade.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const state = states[q.id]
          return (
            <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  <span className="text-brand-600 dark:text-brand-400 font-semibold mr-2">SA{index + 1}.</span>
                  {q.question}
                </p>
                <span className="shrink-0 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {q.topic}
                </span>
              </div>

              <textarea
                value={state.userAnswer}
                onChange={e => updateState(q.id, { userAnswer: e.target.value })}
                disabled={state.revealed}
                placeholder="Type your answer here..."
                className="w-full h-24 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 disabled:bg-gray-50 dark:disabled:bg-gray-800/50"
              />

              {!state.revealed && (
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={() => updateState(q.id, { revealed: true })}>
                    Reveal Model Answer
                  </Button>
                </div>
              )}

              {state.revealed && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Model Answer</p>
                    <p className="text-sm text-blue-900 dark:text-blue-200">{q.sampleAnswer}</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Key Points to Include</p>
                    <ul className="space-y-1">
                      {q.keyPoints.map((point, i) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1.5">
                          <span className="text-brand-500 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {state.selfGraded === null && (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Did you get it right?</p>
                      <Button variant="secondary" size="sm" onClick={() => updateState(q.id, { selfGraded: true })}
                        className="!text-green-700 dark:!text-green-400 !border-green-300 dark:!border-green-700 hover:!bg-green-50 dark:hover:!bg-green-900/20">
                        ✓ Yes
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => updateState(q.id, { selfGraded: false })}
                        className="!text-red-600 dark:!text-red-400 !border-red-300 dark:!border-red-700 hover:!bg-red-50 dark:hover:!bg-red-900/20">
                        ✗ Needs review
                      </Button>
                    </div>
                  )}

                  {state.selfGraded !== null && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      state.selfGraded
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {state.selfGraded ? '✓ Marked correct' : '✗ Needs review'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!submitted && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {allGraded ? 'All questions graded — ready to see results!' : 'Reveal and grade each question to continue.'}
          </p>
          <Button onClick={handleFinish} size="lg" disabled={!allGraded}>
            View Full Results →
          </Button>
        </div>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300">
          ✓ Short answer complete! Scroll down to see your full results.
        </div>
      )}
    </div>
  )
}
