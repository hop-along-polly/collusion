/**
 * The quiz engine.
 *
 * A pure reducer over `QuizState`. It knows nothing about React, routing, storage or
 * styling — which is the point: adding a mode (timed, spaced repetition) or replacing
 * the quiz UI means touching the components or adding an action here, not rewriting
 * the flow. The only outside knowledge it needs is the card list, which is bound once
 * by `createQuizReducer`.
 */

import type { Card } from '@/types/cards'
import type { QuizMode, QuizState, QuizStats, QuizView } from '@/types/quiz'

import { canSubmit, gradeCard, toggleSelection } from './grade'
import { randomSeed, shuffle } from './shuffle'

export interface CreateQuizInput {
  setId: string
  mode: QuizMode
  /** The cards to run, already filtered for the mode (review mode passes a subset). */
  cards: Card[]
  /** Cards already flagged for review, so the star renders in the right state. */
  marked?: string[]
  /** Fixed seed for reproducible ordering; random when omitted. */
  seed?: number
  /** Injected clock, so tests do not depend on wall time. */
  now?: number
}

export function createQuiz(input: CreateQuizInput): QuizState {
  const seed = input.seed ?? randomSeed()
  const startedAt = input.now ?? Date.now()

  return {
    setId: input.setId,
    mode: input.mode,
    order: shuffle(
      input.cards.map((card) => card.id),
      seed,
    ),
    index: 0,
    phase: input.cards.length === 0 ? 'finished' : 'answering',
    selection: [],
    answers: {},
    marked: input.marked ? [...input.marked] : [],
    startedAt,
  }
}

export type QuizAction =
  /** Click an option. Ignored once the card is revealed. */
  | { type: 'toggle'; optionId: string }
  /** Grade the current card and reveal feedback. */
  | { type: 'submit'; now?: number }
  /** Advance past a revealed card; finishes the quiz after the last one. */
  | { type: 'next' }
  /** Flag or unflag the current card for review. */
  | { type: 'toggleMark' }
  /** Jump straight to the results screen, keeping answers so far. */
  | { type: 'finish' }

export type QuizReducer = (state: QuizState, action: QuizAction) => QuizState

export function createQuizReducer(cards: Card[]): QuizReducer {
  const byId = new Map(cards.map((card) => [card.id, card]))

  const cardAt = (state: QuizState): Card | null => {
    const id = state.order[state.index]
    return id ? (byId.get(id) ?? null) : null
  }

  return function quizReducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
      case 'toggle': {
        // Selections are frozen once graded — the revealed card is a record, not a form.
        if (state.phase !== 'answering') return state
        const card = cardAt(state)
        if (!card) return state
        return { ...state, selection: toggleSelection(card, state.selection, action.optionId) }
      }

      case 'submit': {
        if (state.phase !== 'answering') return state
        const card = cardAt(state)
        if (!card || !canSubmit(card, state.selection)) return state

        const answer = gradeCard(card, state.selection, action.now ?? Date.now())
        return {
          ...state,
          phase: 'revealed',
          answers: { ...state.answers, [card.id]: answer },
        }
      }

      case 'next': {
        if (state.phase !== 'revealed') return state
        const nextIndex = state.index + 1
        const done = nextIndex >= state.order.length
        return {
          ...state,
          index: nextIndex,
          phase: done ? 'finished' : 'answering',
          selection: [],
        }
      }

      case 'toggleMark': {
        const card = cardAt(state)
        if (!card) return state
        const marked = state.marked.includes(card.id)
          ? state.marked.filter((id) => id !== card.id)
          : [...state.marked, card.id]
        return { ...state, marked }
      }

      case 'finish':
        return { ...state, phase: 'finished', index: state.order.length, selection: [] }

      default:
        return state
    }
  }
}

export function computeStats(state: QuizState): QuizStats {
  const answers = Object.values(state.answers)
  const correct = answers.filter((answer) => answer.isCorrect).length
  const answered = answers.length

  return {
    answered,
    correct,
    incorrect: answered - correct,
    remaining: Math.max(0, state.order.length - answered),
    accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
  }
}

/** Everything the current step of the UI needs, derived in one place. */
export function selectView(state: QuizState, cards: Card[]): QuizView {
  const byId = new Map(cards.map((card) => [card.id, card]))
  const id = state.order[state.index]
  const card = id ? (byId.get(id) ?? null) : null

  return {
    card,
    position: Math.min(state.index + 1, state.order.length),
    total: state.order.length,
    phase: state.phase,
    selection: state.selection,
    answer: card ? (state.answers[card.id] ?? null) : null,
    isMarked: card ? state.marked.includes(card.id) : false,
    stats: computeStats(state),
  }
}

/** Card ids answered incorrectly during this session — used to seed a follow-up review. */
export function missedCardIds(state: QuizState): string[] {
  return state.order.filter((id) => state.answers[id]?.isCorrect === false)
}
