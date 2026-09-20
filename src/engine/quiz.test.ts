import { describe, expect, it } from 'vitest'

import type { Card } from '@/types/cards'
import { canSubmit, gradeCard, toggleSelection, verdictFor } from './grade'
import { computeStats, createQuiz, createQuizReducer, missedCardIds, selectView } from './quiz'
import { shuffle } from './shuffle'

function card(id: string, type: Card['type'], correctIds: string[]): Card {
  const options = ['a', 'b', 'c', 'd'].map((optionId) => ({
    id: optionId,
    text: optionId.toUpperCase(),
    correct: correctIds.includes(optionId),
  }))

  if (type === 'boolean') {
    return {
      id,
      type,
      prompt: 'p',
      explanation: 'e',
      citations: [{ file: 'notes.md' }],
      options: [
        { id: 'a', text: 'True', correct: correctIds.includes('a') },
        { id: 'b', text: 'False', correct: correctIds.includes('b') },
      ],
    }
  }

  return { id, type, prompt: 'p', explanation: 'e', citations: [{ file: 'notes.md' }], options }
}

describe('gradeCard', () => {
  it('marks a multi card correct only on an exact match', () => {
    const subject = card('c1', 'multi', ['a', 'c'])

    expect(gradeCard(subject, ['a', 'c'], 0).isCorrect).toBe(true)
    // Partial credit is deliberately not awarded.
    expect(gradeCard(subject, ['a'], 0).isCorrect).toBe(false)
    expect(gradeCard(subject, ['a', 'c', 'd'], 0).isCorrect).toBe(false)
  })

  it('reports what was missed and what was wrongly selected', () => {
    const answer = gradeCard(card('c1', 'multi', ['a', 'c']), ['a', 'b'], 0)

    expect(answer.missed).toEqual(['c'])
    expect(answer.falsePositives).toEqual(['b'])
  })

  it('deduplicates a repeated selection', () => {
    const answer = gradeCard(card('c1', 'multi', ['a']), ['a', 'a'], 0)

    expect(answer.selected).toEqual(['a'])
    expect(answer.isCorrect).toBe(true)
  })
})

describe('canSubmit', () => {
  it('requires at least one option for every card type', () => {
    expect(canSubmit(card('c1', 'single', ['a']), [])).toBe(false)
    expect(canSubmit(card('c1', 'multi', ['a']), [])).toBe(false)
    expect(canSubmit(card('c1', 'boolean', ['a']), [])).toBe(false)
  })

  it('allows several options only on multi cards', () => {
    expect(canSubmit(card('c1', 'multi', ['a']), ['a', 'b'])).toBe(true)
    expect(canSubmit(card('c1', 'single', ['a']), ['a', 'b'])).toBe(false)
  })
})

describe('toggleSelection', () => {
  it('replaces the choice on single-answer cards', () => {
    const subject = card('c1', 'single', ['a'])

    expect(toggleSelection(subject, ['a'], 'b')).toEqual(['b'])
    expect(toggleSelection(subject, ['a'], 'a')).toEqual([])
  })

  it('accumulates choices on multi cards', () => {
    const subject = card('c1', 'multi', ['a', 'b'])

    expect(toggleSelection(subject, ['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleSelection(subject, ['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('verdictFor', () => {
  it('distinguishes hits, misses and false positives', () => {
    const subject = card('c1', 'multi', ['a', 'b'])

    expect(verdictFor(subject, 'a', ['a', 'c'])).toBe('hit')
    expect(verdictFor(subject, 'b', ['a', 'c'])).toBe('missed')
    expect(verdictFor(subject, 'c', ['a', 'c'])).toBe('false-positive')
    expect(verdictFor(subject, 'd', ['a', 'c'])).toBe('neutral')
  })
})

describe('shuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  it('is deterministic for a given seed', () => {
    expect(shuffle(items, 42)).toEqual(shuffle(items, 42))
  })

  it('keeps every item exactly once and leaves the input untouched', () => {
    const result = shuffle(items, 7)

    expect([...result].sort()).toEqual([...items].sort())
    expect(items).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
  })
})

describe('quiz reducer', () => {
  const cards = [card('c1', 'single', ['a']), card('c2', 'multi', ['a', 'b']), card('c3', 'boolean', ['a'])]
  const reduce = createQuizReducer(cards)

  const start = () => createQuiz({ setId: 'demo', mode: 'practice', cards, seed: 1, now: 0 })

  it('starts on the first card awaiting an answer', () => {
    const state = start()

    expect(state.phase).toBe('answering')
    expect(state.index).toBe(0)
    expect(state.order).toHaveLength(3)
  })

  it('ignores submit until something is selected', () => {
    const state = start()

    expect(reduce(state, { type: 'submit', now: 1 })).toBe(state)
  })

  it('grades on submit and freezes the selection', () => {
    let state = start()
    const currentId = state.order[0] as string

    state = reduce(state, { type: 'toggle', optionId: 'a' })
    state = reduce(state, { type: 'submit', now: 5 })

    expect(state.phase).toBe('revealed')
    expect(state.answers[currentId]?.answeredAt).toBe(5)

    // Further clicks must not change a graded answer.
    const frozen = reduce(state, { type: 'toggle', optionId: 'b' })
    expect(frozen.selection).toEqual(state.selection)
  })

  it('only advances from a revealed card, and clears the pending selection', () => {
    let state = start()

    expect(reduce(state, { type: 'next' })).toBe(state)

    state = reduce(state, { type: 'toggle', optionId: 'a' })
    state = reduce(state, { type: 'submit', now: 1 })
    state = reduce(state, { type: 'next' })

    expect(state.index).toBe(1)
    expect(state.phase).toBe('answering')
    expect(state.selection).toEqual([])
  })

  it('finishes after the last card', () => {
    let state = start()

    for (let i = 0; i < cards.length; i += 1) {
      state = reduce(state, { type: 'toggle', optionId: 'a' })
      state = reduce(state, { type: 'submit', now: i })
      state = reduce(state, { type: 'next' })
    }

    expect(state.phase).toBe('finished')
    expect(selectView(state, cards).card).toBeNull()
  })

  it('ends early on finish, keeping answers already given', () => {
    let state = start()
    state = reduce(state, { type: 'toggle', optionId: 'a' })
    state = reduce(state, { type: 'submit', now: 1 })
    state = reduce(state, { type: 'finish' })

    expect(state.phase).toBe('finished')
    expect(Object.keys(state.answers)).toHaveLength(1)
    expect(computeStats(state).remaining).toBe(2)
  })

  it('toggles a mark on the current card', () => {
    let state = start()
    const currentId = state.order[0] as string

    state = reduce(state, { type: 'toggleMark' })
    expect(state.marked).toEqual([currentId])

    state = reduce(state, { type: 'toggleMark' })
    expect(state.marked).toEqual([])
  })

  it('treats an empty card list as an immediately finished session', () => {
    const state = createQuiz({ setId: 'demo', mode: 'review', cards: [], seed: 1, now: 0 })

    expect(state.phase).toBe('finished')
    expect(selectView(state, []).total).toBe(0)
  })
})

describe('stats and missed cards', () => {
  const cards = [card('c1', 'single', ['a']), card('c2', 'single', ['b'])]
  const reduce = createQuizReducer(cards)

  it('counts accuracy over answered cards only', () => {
    let state = createQuiz({ setId: 'demo', mode: 'practice', cards, seed: 3, now: 0 })

    // Answer 'a' on both: correct for c1, incorrect for c2.
    for (let i = 0; i < 2; i += 1) {
      state = reduce(state, { type: 'toggle', optionId: 'a' })
      state = reduce(state, { type: 'submit', now: i })
      state = reduce(state, { type: 'next' })
    }

    const stats = computeStats(state)
    expect(stats.answered).toBe(2)
    expect(stats.correct).toBe(1)
    expect(stats.accuracy).toBe(50)
    expect(missedCardIds(state)).toEqual(['c2'])
  })

  it('reports zero accuracy rather than NaN before anything is answered', () => {
    expect(computeStats(createQuiz({ setId: 'd', mode: 'practice', cards, seed: 1, now: 0 })).accuracy).toBe(0)
  })
})
