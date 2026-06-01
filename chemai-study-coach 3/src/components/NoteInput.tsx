/**
 * NoteInput.tsx
 * Main input panel: paste notes OR upload a file.
 * File upload text drops into the same textarea so the quiz flow is unchanged.
 */

'use client'

import { useState } from 'react'
import { Quiz } from '@/lib/types'
import { saveQuiz } from '@/lib/storage'
import Button from './Button'
import FileUpload from './FileUpload'

interface NoteInputProps {
  onQuizGenerated: (quiz: Quiz) => void
}

const EXAMPLE_NOTES = `Acid-Base Chemistry: Brønsted-Lowry Theory

An acid is a proton donor; a base is a proton acceptor.

Strong acids (HCl, HNO3, H2SO4) fully dissociate in water.
Weak acids (acetic acid, carbonic acid) only partially dissociate.

pH = -log[H+]
pOH = -log[OH-]
pH + pOH = 14 at 25°C

Buffer solutions resist pH change when small amounts of acid or base are added. A buffer is made from a weak acid and its conjugate base (or weak base and conjugate acid).

Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])

Ka × Kb = Kw = 1.0 × 10^-14`

export default function NoteInput({ onQuizGenerated }: NoteInputProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!notes.trim()) {
      setError('Please paste some chemistry notes first.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz.')
      }

      saveQuiz(data.quiz)
      onQuizGenerated(data.quiz)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function loadExample() {
    setNotes(EXAMPLE_NOTES)
    setError(null)
  }

  // Called by FileUpload when text is successfully extracted from a file
  function handleTextExtracted(text: string) {
    setNotes(prev => {
      // If textarea already has content, append with a separator
      if (prev.trim()) return prev + '\n\n---\n\n' + text
      return text
    })
    setError(null)
  }

  const charCount = notes.length
  const charLimit = 8000
  const isNearLimit = charCount > charLimit * 0.85

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          acetic.ai
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Paste your notes or upload a file to generate a practice quiz.
        </p>
      </div>

      {/* Two-column input layout: upload on left, paste on right */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 mb-0">
        {/* Left: file upload */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload a file
          </span>
          <FileUpload onTextExtracted={handleTextExtracted} />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Text will appear in the notes box →
          </p>
        </div>

        {/* Right: text area */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Or paste notes directly
            </span>
            <button
              onClick={loadExample}
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >
              Load example
            </button>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={"Paste your notes, a textbook section, or a list of topics here...\n\nExample: Organic chemistry, reaction mechanisms, SN1 vs SN2..."}
            className="w-full h-52 p-4 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 bg-white dark:bg-gray-900 resize-none focus:outline-none font-mono leading-relaxed"
            maxLength={charLimit}
          />

          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
            <span className={`text-xs ${isNearLimit ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {charCount.toLocaleString()} / {charLimit.toLocaleString()}
            </span>
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={loading || !notes.trim()}
              size="md"
            >
              {loading ? 'Generating quiz…' : '✦ Generate Quiz'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: '📝', label: '10 Multiple Choice', desc: 'Test your recall and understanding' },
          { icon: '✍️', label: '5 Short Answer', desc: 'Practice explaining concepts' },
          { icon: '📊', label: 'Instant Feedback', desc: 'See your score and weak spots' },
        ].map(item => (
          <div key={item.label} className="text-center p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
