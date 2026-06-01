/**
 * page.tsx — Root page.
 * This is the main app shell. It manages which "view" is shown and
 * orchestrates the flow: input → quiz → results → dashboard.
 *
 * All state is kept here so child components stay simple and focused.
 */

'use client'

import { useState } from 'react'
import {
  Quiz,
  MultipleChoiceAnswer,
  ShortAnswerResponse,
  QuizResult,
  IncorrectQuestion,
} from '@/lib/types'
import { saveResult } from '@/lib/storage'
import { generateId } from '@/lib/utils'

import Header from '@/components/Header'
import NoteInput from '@/components/NoteInput'
import MultipleChoiceSection from '@/components/MultipleChoiceSection'
import ShortAnswerSection from '@/components/ShortAnswerSection'
import ResultsPanel from '@/components/ResultsPanel'
import Dashboard from '@/components/Dashboard'

// The app has 5 views:
// home → mc-quiz → sa-quiz → results → dashboard
type View = 'home' | 'mc-quiz' | 'sa-quiz' | 'results' | 'dashboard'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [mcAnswers, setMcAnswers] = useState<MultipleChoiceAnswer[]>([])
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null)

  // ── Step 1: Quiz was generated ────────────────────────────────────────────
  function handleQuizGenerated(quiz: Quiz) {
    setCurrentQuiz(quiz)
    setMcAnswers([])
    setCurrentResult(null)
    setView('mc-quiz')
    window.scrollTo(0, 0)
  }

  // ── Step 2: Multiple choice completed ────────────────────────────────────
  function handleMcComplete(answers: MultipleChoiceAnswer[]) {
    setMcAnswers(answers)
    // Scroll to short answer section
    setTimeout(() => {
      document.getElementById('short-answer-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // ── Step 3: Short answer completed → save result ─────────────────────────
  function handleSaComplete(saResponses: ShortAnswerResponse[]) {
    if (!currentQuiz) return

    const mcScore = mcAnswers.filter(a => a.isCorrect).length

    // Collect weak topics from wrong MC answers
    const weakTopicSet = new Set<string>()
    const incorrectQuestions: IncorrectQuestion[] = []

    for (const answer of mcAnswers) {
      if (!answer.isCorrect) {
        const question = currentQuiz.multipleChoice.find(q => q.id === answer.questionId)
        if (question) {
          weakTopicSet.add(question.topic)
          incorrectQuestions.push({
            question,
            userAnswer: answer.selectedOption,
            correctAnswer: question.correctAnswer,
          })
        }
      }
    }

    // Also add topics from self-graded short answers
    for (const response of saResponses) {
      if (response.selfGraded === false) {
        const question = currentQuiz.shortAnswer.find(q => q.id === response.questionId)
        if (question) {
          weakTopicSet.add(question.topic)
        }
      }
    }

    const result: QuizResult = {
      id: generateId(),
      quizId: currentQuiz.id,
      completedAt: new Date().toISOString(),
      mcScore,
      mcTotal: currentQuiz.multipleChoice.length,
      weakTopics: Array.from(weakTopicSet),
      incorrectQuestions,
    }

    saveResult(result)
    setCurrentResult(result)
    setView('results')
    window.scrollTo(0, 0)
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleNavigate(target: string) {
    if (target === 'home') {
      setView('home')
      setCurrentQuiz(null)
    } else if (target === 'dashboard') {
      setView('dashboard')
    }
    window.scrollTo(0, 0)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Header currentView={view === 'dashboard' ? 'dashboard' : 'home'} onNavigate={handleNavigate} />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* VIEW: Home — note input */}
        {view === 'home' && (
          <NoteInput onQuizGenerated={handleQuizGenerated} />
        )}

        {/* VIEW: Quiz — both sections shown once MC is done */}
        {(view === 'mc-quiz' || view === 'sa-quiz') && currentQuiz && (
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Quiz header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Practice Quiz</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Generated from your notes · {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleNavigate('home')}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                ← New quiz
              </button>
            </div>

            {/* Multiple choice */}
            <MultipleChoiceSection
              questions={currentQuiz.multipleChoice}
              onComplete={handleMcComplete}
            />

            {/* Short answer (shown below MC once MC is submitted) */}
            {mcAnswers.length > 0 && (
              <div id="short-answer-section">
                <ShortAnswerSection
                  questions={currentQuiz.shortAnswer}
                  onComplete={handleSaComplete}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW: Results */}
        {view === 'results' && currentResult && (
          <ResultsPanel
            result={currentResult}
            onNewQuiz={() => handleNavigate('home')}
            onViewDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {/* VIEW: Dashboard */}
        {view === 'dashboard' && (
          <Dashboard onStartQuiz={() => handleNavigate('home')} />
        )}
      </main>
    </div>
  )
}
