// ─── Quiz Data Types ───────────────────────────────────────────────────────────

export interface MultipleChoiceQuestion {
  id: string
  type: 'multiple-choice'
  question: string
  options: string[]           // Always 4 options: A, B, C, D
  correctAnswer: string       // The full text of the correct option
  explanation: string         // Why this answer is correct
  topic: string               // e.g. "Stoichiometry", "Atomic Structure"
}

export interface ShortAnswerQuestion {
  id: string
  type: 'short-answer'
  question: string
  sampleAnswer: string        // Model answer for comparison
  keyPoints: string[]         // Key concepts the answer should include
  topic: string
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion

export interface Quiz {
  id: string
  createdAt: string
  sourceNotes: string         // The original text the user pasted
  multipleChoice: MultipleChoiceQuestion[]
  shortAnswer: ShortAnswerQuestion[]
}

// ─── User Answer Types ─────────────────────────────────────────────────────────

export interface MultipleChoiceAnswer {
  questionId: string
  selectedOption: string      // The full text of what user picked
  isCorrect: boolean
}

export interface ShortAnswerResponse {
  questionId: string
  userAnswer: string
  selfGraded: boolean | null  // User marks whether they got it right
}

// ─── Results Types ─────────────────────────────────────────────────────────────

export interface QuizResult {
  id: string
  quizId: string
  completedAt: string
  mcScore: number             // 0–10
  mcTotal: number             // usually 10
  weakTopics: string[]        // Topics where user got questions wrong
  incorrectQuestions: IncorrectQuestion[]
}

export interface IncorrectQuestion {
  question: MultipleChoiceQuestion
  userAnswer: string
  correctAnswer: string
}

// ─── Local Storage Shape ───────────────────────────────────────────────────────
// Everything is saved in localStorage for the MVP.
// Phase 2: migrate to Supabase.

export interface AppStorage {
  quizzes: Quiz[]             // All generated quizzes
  results: QuizResult[]       // All completed quiz results
}
