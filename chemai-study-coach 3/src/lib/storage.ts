/**
 * storage.ts
 * Simple localStorage wrapper for the MVP.
 * Phase 2: Replace these functions with Supabase calls.
 */

import { AppStorage, Quiz, QuizResult } from './types'

const STORAGE_KEY = 'acetic_data'

// ─── Read/Write Helpers ────────────────────────────────────────────────────────

function readStorage(): AppStorage {
  if (typeof window === 'undefined') return { quizzes: [], results: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quizzes: [], results: [] }
    return JSON.parse(raw) as AppStorage
  } catch {
    return { quizzes: [], results: [] }
  }
}

function writeStorage(data: AppStorage): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Quiz Functions ────────────────────────────────────────────────────────────

export function saveQuiz(quiz: Quiz): void {
  const data = readStorage()
  // Keep only the last 20 quizzes to avoid bloating localStorage
  const updated = [quiz, ...data.quizzes].slice(0, 20)
  writeStorage({ ...data, quizzes: updated })
}

export function getQuiz(quizId: string): Quiz | null {
  const data = readStorage()
  return data.quizzes.find(q => q.id === quizId) ?? null
}

export function getAllQuizzes(): Quiz[] {
  return readStorage().quizzes
}

// ─── Results Functions ─────────────────────────────────────────────────────────

export function saveResult(result: QuizResult): void {
  const data = readStorage()
  const updated = [result, ...data.results].slice(0, 50)
  writeStorage({ ...data, results: updated })
}

export function getAllResults(): QuizResult[] {
  return readStorage().results
}

// ─── Dashboard Helpers ─────────────────────────────────────────────────────────

/**
 * Counts how many times each weak topic appears across all results.
 * Returns topics sorted by frequency (most frequent first).
 */
export function getWeakTopicSummary(): { topic: string; count: number }[] {
  const results = getAllResults()
  const counts: Record<string, number> = {}

  for (const result of results) {
    for (const topic of result.weakTopics) {
      counts[topic] = (counts[topic] ?? 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Average MC score across all attempts (as a percentage 0–100).
 */
export function getAverageScore(): number {
  const results = getAllResults()
  if (results.length === 0) return 0
  const total = results.reduce((sum, r) => sum + (r.mcScore / r.mcTotal) * 100, 0)
  return Math.round(total / results.length)
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
