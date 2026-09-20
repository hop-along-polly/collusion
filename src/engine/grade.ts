/**
 * Grading. Pure functions over a card and a selection — no React, no storage.
 */

import type { Card } from '@/types/cards'
import type { GradedAnswer, Selection } from '@/types/quiz'

export function correctOptionIds(card: Card): string[] {
  return card.options.filter((option) => option.correct).map((option) => option.id)
}

/**
 * A card is correct only when the selection matches the key exactly: every correct
 * option chosen and no incorrect one. Partial credit is deliberately not awarded —
 * "select all that apply" questions on real exams are all-or-nothing, and treating
 * them that way keeps the accuracy figure honest.
 */
export function gradeCard(card: Card, selection: Selection, now: number): GradedAnswer {
  const key = new Set(correctOptionIds(card))
  const chosen = new Set(selection)

  const falsePositives = [...chosen].filter((id) => !key.has(id))
  const missed = [...key].filter((id) => !chosen.has(id))

  return {
    cardId: card.id,
    selected: [...chosen],
    isCorrect: falsePositives.length === 0 && missed.length === 0,
    falsePositives,
    missed,
    answeredAt: now,
  }
}

/**
 * Whether a selection is complete enough to submit. Every card type needs at least
 * one option; `single` and `boolean` cannot take more than one.
 */
export function canSubmit(card: Card, selection: Selection): boolean {
  if (selection.length === 0) return false
  if (card.type === 'multi') return true
  return selection.length === 1
}

/** Apply a click to the pending selection, respecting the card's arity. */
export function toggleSelection(card: Card, selection: Selection, optionId: string): Selection {
  if (card.type === 'multi') {
    return selection.includes(optionId)
      ? selection.filter((id) => id !== optionId)
      : [...selection, optionId]
  }
  // Single-answer cards behave like radio buttons: picking one replaces the other.
  return selection.includes(optionId) ? [] : [optionId]
}

/** How an individual option should be rendered once the card has been graded. */
export type OptionVerdict =
  /** Correct and chosen. */
  | 'hit'
  /** Correct but not chosen. */
  | 'missed'
  /** Incorrect and chosen. */
  | 'false-positive'
  /** Incorrect and not chosen — the quiet majority. */
  | 'neutral'

export function verdictFor(card: Card, optionId: string, selection: Selection): OptionVerdict {
  const option = card.options.find((candidate) => candidate.id === optionId)
  if (!option) return 'neutral'
  const chosen = selection.includes(optionId)

  if (option.correct) return chosen ? 'hit' : 'missed'
  return chosen ? 'false-positive' : 'neutral'
}
