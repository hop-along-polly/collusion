import type { Card } from './cards'

/** Option ids the learner has selected, in no particular order. */
export type Selection = string[]

export type QuizMode =
  /** Every card in the set, shuffled. */
  | 'practice'
  /** Only cards previously missed or marked for review. */
  | 'review'

/**
 * `answering` — awaiting a selection + Submit.
 * `revealed`  — graded; feedback, explanation and citations are on screen.
 * `finished`  — past the last card; the results screen is showing.
 */
export type QuizPhase = 'answering' | 'revealed' | 'finished'

/** The outcome of grading one card. */
export interface GradedAnswer {
  cardId: string
  selected: Selection
  isCorrect: boolean
  /** Selected options that were wrong. */
  falsePositives: string[]
  /** Correct options the learner failed to select. */
  missed: string[]
  /** Epoch millis. */
  answeredAt: number
}

/**
 * The whole quiz session. Produced only by the reducer in `src/engine/quiz.ts`,
 * which is pure and framework-agnostic — swapping the quiz UI means replacing the
 * components, not this state.
 */
export interface QuizState {
  setId: string
  mode: QuizMode
  /** Card ids in presentation order; the source of truth for "which card is next". */
  order: string[]
  /** Index into `order`. Equals `order.length` once finished. */
  index: number
  phase: QuizPhase
  /** Pending selection for the current card; cleared on advance. */
  selection: Selection
  /** Grades so far, keyed by card id. */
  answers: Record<string, GradedAnswer>
  /** Cards flagged during this session. Mirrored into persisted progress. */
  marked: string[]
  /** When the session started (epoch millis) — used for session stats. */
  startedAt: number
}

/** Everything the quiz UI needs for the current step, derived from `QuizState`. */
export interface QuizView {
  card: Card | null
  position: number
  total: number
  phase: QuizPhase
  selection: Selection
  answer: GradedAnswer | null
  isMarked: boolean
  stats: QuizStats
}

export interface QuizStats {
  answered: number
  correct: number
  incorrect: number
  remaining: number
  /** 0-100, rounded; 0 when nothing has been answered. */
  accuracy: number
}
