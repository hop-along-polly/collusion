import { describe, expect, it } from 'vitest'

import {
  completeSession,
  emptySnapshot,
  getCardProgress,
  overallSummary,
  recordAnswer,
  resetSet,
  reviewableCardIds,
  setMarked,
  summarize,
} from './progress'

const SET = 'anthropic/claude-api'
const IDS = ['c1', 'c2', 'c3']

describe('recordAnswer', () => {
  it('accumulates counters and tracks the latest result', () => {
    let snapshot = emptySnapshot(0)
    snapshot = recordAnswer(snapshot, SET, 'c1', false, 10)
    snapshot = recordAnswer(snapshot, SET, 'c1', true, 20)

    const card = getCardProgress(snapshot, SET, 'c1')
    expect(card).toMatchObject({ attempts: 2, correct: 1, incorrect: 1, lastResult: 'correct', lastSeenAt: 20 })
  })

  it('stamps updatedAt so a future sync can order writes', () => {
    const snapshot = recordAnswer(emptySnapshot(0), SET, 'c1', true, 99)
    expect(snapshot.updatedAt).toBe(99)
  })

  it('does not mutate the snapshot it was given', () => {
    const before = emptySnapshot(0)
    recordAnswer(before, SET, 'c1', true, 10)
    expect(before.sets).toEqual({})
  })
})

describe('review eligibility', () => {
  it('includes cards missed on their most recent attempt', () => {
    let snapshot = emptySnapshot(0)
    snapshot = recordAnswer(snapshot, SET, 'c1', false, 1)
    snapshot = recordAnswer(snapshot, SET, 'c2', true, 1)

    expect(reviewableCardIds(snapshot, SET, IDS)).toEqual(['c1'])
  })

  it('drops a card once it is answered correctly again', () => {
    let snapshot = recordAnswer(emptySnapshot(0), SET, 'c1', false, 1)
    expect(reviewableCardIds(snapshot, SET, IDS)).toEqual(['c1'])

    snapshot = recordAnswer(snapshot, SET, 'c1', true, 2)
    expect(reviewableCardIds(snapshot, SET, IDS)).toEqual([])
  })

  it('keeps a marked card even when it is answered correctly', () => {
    let snapshot = recordAnswer(emptySnapshot(0), SET, 'c1', true, 1)
    snapshot = setMarked(snapshot, SET, 'c1', true, 2)

    expect(reviewableCardIds(snapshot, SET, IDS)).toEqual(['c1'])
    expect(summarize(snapshot, SET, IDS).marked).toBe(1)
  })

  it('excludes cards that have never been seen', () => {
    expect(reviewableCardIds(emptySnapshot(0), SET, IDS)).toEqual([])
  })

  it('returns ids in set order, not in the order they were answered', () => {
    let snapshot = emptySnapshot(0)
    snapshot = recordAnswer(snapshot, SET, 'c3', false, 1)
    snapshot = recordAnswer(snapshot, SET, 'c1', false, 2)

    expect(reviewableCardIds(snapshot, SET, IDS)).toEqual(['c1', 'c3'])
  })
})

describe('summarize', () => {
  it('reports accuracy over attempted cards only', () => {
    let snapshot = emptySnapshot(0)
    snapshot = recordAnswer(snapshot, SET, 'c1', true, 1)
    snapshot = recordAnswer(snapshot, SET, 'c2', false, 2)
    snapshot = setMarked(snapshot, SET, 'c1', true, 3)

    expect(summarize(snapshot, SET, IDS)).toMatchObject({
      attempted: 2,
      correct: 1,
      missed: 1,
      marked: 1,
      reviewable: 2,
      accuracy: 50,
    })
  })

  it('is all zeroes for an untouched set', () => {
    expect(summarize(emptySnapshot(0), SET, IDS)).toMatchObject({ attempted: 0, accuracy: 0, reviewable: 0 })
  })

  it('ignores progress for cards no longer in the set', () => {
    const snapshot = recordAnswer(emptySnapshot(0), SET, 'removed-card', true, 1)
    expect(summarize(snapshot, SET, IDS).attempted).toBe(0)
  })
})

describe('sessions and reset', () => {
  it('counts completed sessions and stamps the last one', () => {
    let snapshot = completeSession(emptySnapshot(0), SET, 50)
    snapshot = completeSession(snapshot, SET, 80)

    expect(snapshot.sets[SET]).toMatchObject({ sessionsCompleted: 2, lastSessionAt: 80 })
  })

  it('clears one set without touching the others', () => {
    let snapshot = recordAnswer(emptySnapshot(0), SET, 'c1', true, 1)
    snapshot = recordAnswer(snapshot, 'devops/ansible', 'a1', true, 2)

    const after = resetSet(snapshot, SET, 3)
    expect(after.sets[SET]).toBeUndefined()
    expect(after.sets['devops/ansible']).toBeDefined()
  })
})

describe('overallSummary', () => {
  it('aggregates across sets without needing card lists', () => {
    let snapshot = emptySnapshot(0)
    snapshot = recordAnswer(snapshot, SET, 'c1', true, 1)
    snapshot = recordAnswer(snapshot, SET, 'c2', false, 2)
    snapshot = recordAnswer(snapshot, 'devops/ansible', 'a1', true, 3)

    expect(overallSummary(snapshot)).toMatchObject({
      attempted: 3,
      correct: 2,
      reviewable: 1,
      setsStarted: 2,
      accuracy: 67,
    })
  })
})
