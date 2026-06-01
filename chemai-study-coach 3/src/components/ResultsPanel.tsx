/**
 * ResultsPanel.tsx — with dark mode classes.
 */

'use client'

import { QuizResult } from '@/lib/types'
import { formatDate, scoreBgColor } from '@/lib/utils'
import Button from './Button'

interface Props {
  result: QuizResult
  onNewQuiz: () => void
  onViewDashboard: () => void
}

// Dark-mode-aware score color (bg only, text handled separately)
function scoreBgDark(pct: number): string {
  if (pct >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (pct >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
}

export default function ResultsPanel({ result, onNewQuiz, onViewDashboard }: Props) {
  const scorePct = Math.round((result.mcScore / result.mcTotal) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Quiz completed on {formatDate(result.completedAt)}
        </p>
        <div className={`inline-flex items-center gap-2 text-4xl font-bold px-6 py-3 rounded-xl ${scoreBgDark(scorePct)}`}>
          {result.mcScore} / {result.mcTotal}
          <span className="text-2xl">({scorePct}%)</span>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {scorePct >= 80
            ? '🎉 Great work! You have a strong grasp of this material.'
            : scorePct >= 60
            ? '📚 Good effort. Review the weak topics below to improve.'
            : '🔄 Keep studying! Focus on the topics listed below.'}
        </p>
      </div>

      {/* Weak Topics */}
      {result.weakTopics.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>📌</span> Topics to Review
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.weakTopics.map(topic => (
              <span key={topic}
                className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-sm rounded-full">
                {topic}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            These are topics where you answered at least one question incorrectly.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-5 text-center">
          <p className="text-green-800 dark:text-green-300 font-medium">
            🏆 Perfect score on multiple choice! No weak topics to review.
          </p>
        </div>
      )}

      {/* Incorrect Questions Review */}
      {result.incorrectQuestions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>❌</span> Questions to Review ({result.incorrectQuestions.length})
          </h3>
          <div className="space-y-4">
            {result.incorrectQuestions.map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2">{item.question.question}</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-red-500 font-semibold shrink-0">Your answer:</span>
                    <span className="text-red-700 dark:text-red-400 line-through">{item.userAnswer}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 dark:text-green-400 font-semibold shrink-0">Correct:</span>
                    <span className="text-green-800 dark:text-green-300 font-medium">{item.correctAnswer}</span>
                  </div>
                </div>
                {item.question.explanation && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="font-medium">Why: </span>{item.question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onNewQuiz} variant="primary" size="lg" className="flex-1">✦ Generate New Quiz</Button>
        <Button onClick={onViewDashboard} variant="secondary" size="lg" className="flex-1">📊 View Progress Dashboard</Button>
      </div>
    </div>
  )
}
