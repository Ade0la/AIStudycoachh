/**
 * Dashboard.tsx — with dark mode classes.
 */

'use client'

import { useEffect, useState } from 'react'
import { QuizResult } from '@/lib/types'
import { getAllResults, getWeakTopicSummary, getAverageScore, clearAllData } from '@/lib/storage'
import { formatDate, scoreBgColor } from '@/lib/utils'
import Button from './Button'

interface Props {
  onStartQuiz: () => void
}

function scoreBgDark(pct: number): string {
  if (pct >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  if (pct >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
  return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
}

export default function Dashboard({ onStartQuiz }: Props) {
  const [results, setResults] = useState<QuizResult[]>([])
  const [weakTopics, setWeakTopics] = useState<{ topic: string; count: number }[]>([])
  const [avgScore, setAvgScore] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    setResults(getAllResults())
    setWeakTopics(getWeakTopicSummary())
    setAvgScore(getAverageScore())
  }, [])

  function handleClearData() {
    clearAllData()
    setResults([])
    setWeakTopics([])
    setAvgScore(0)
    setShowClearConfirm(false)
  }

  if (results.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No quizzes yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Complete your first quiz to see your progress dashboard.
        </p>
        <Button onClick={onStartQuiz} size="lg">Start Studying</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Based on {results.length} completed quiz{results.length > 1 ? 'zes' : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg. MC Score" value={`${avgScore}%`} colorClass={scoreBgDark(avgScore)} />
        <StatCard label="Quizzes Taken" value={results.length.toString()} colorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" />
        <StatCard label="Weak Topics" value={weakTopics.length.toString()} colorClass="bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300" />
      </div>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📌 Topics to Focus On</h3>
          <div className="space-y-2">
            {weakTopics.slice(0, 10).map(({ topic, count }) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">{topic}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${Math.min((count / (weakTopics[0]?.count || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                    {count}× missed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Results</h3>
        <div className="space-y-3">
          {results.slice(0, 10).map((result) => {
            const pct = Math.round((result.mcScore / result.mcTotal) * 100)
            return (
              <div key={result.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(result.completedAt)}</p>
                  {result.weakTopics.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Weak: {result.weakTopics.slice(0, 3).join(', ')}
                      {result.weakTopics.length > 3 && ` +${result.weakTopics.length - 3} more`}
                    </p>
                  )}
                </div>
                <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${scoreBgDark(pct)}`}>
                  {result.mcScore}/{result.mcTotal} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={onStartQuiz} size="md">✦ Start New Quiz</Button>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            Clear all data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Are you sure?</span>
            <button onClick={handleClearData} className="text-xs text-red-600 dark:text-red-400 font-medium hover:text-red-700">Yes, clear</button>
            <button onClick={() => setShowClearConfirm(false)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700">Cancel</button>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Coming in Phase 2:</span> spaced repetition reminders, progress charts over time, and difficulty scaling.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, colorClass }: { label: string; value: string; colorClass: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm">
      <div className={`text-2xl font-bold px-2 py-1 rounded-lg inline-block ${colorClass}`}>{value}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{label}</p>
    </div>
  )
}
