/**
 * Progress persistence.
 *
 * Split in two on purpose:
 *  - pure functions (`recordAnswer`, `setMarked`, …) that take a snapshot and return a
 *    new one. These are the whole domain model and are trivially testable.
 *  - a thin adapter (`loadProgress` / `saveProgress`) that reads and writes
 *    localStorage, which is the only part that has to change when a server exists.
 *
 * See ARCHITECTURE.md → "Freemium path" for how this becomes an account-backed store.
 */

import {
  LOCAL_OWNER,
  PROGRESS_SCHEMA_VERSION,
  type CardProgress,
  type ProgressSnapshot,
  type SetProgress,
  type SetProgressSummary,
} from '@/types/progress'

export const STORAGE_KEY = 'scribe-cards.progress.v1'

export function emptySnapshot(now = Date.now()): ProgressSnapshot {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    ownerId: LOCAL_OWNER,
    updatedAt: now,
    sets: {},
  }
}

function emptySetProgress(): SetProgress {
  return { cards: {}, lastSessionAt: null, sessionsCompleted: 0 }
}

function emptyCardProgress(): CardProgress {
  return { attempts: 0, correct: 0, incorrect: 0, lastResult: null, lastSeenAt: 0, marked: false }
}

// --- Pure updates ----------------------------------------------------------

function updateCard(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardId: string,
  now: number,
  update: (card: CardProgress) => CardProgress,
): ProgressSnapshot {
  const set = snapshot.sets[setKey] ?? emptySetProgress()
  const card = set.cards[cardId] ?? emptyCardProgress()

  return {
    ...snapshot,
    updatedAt: now,
    sets: {
      ...snapshot.sets,
      [setKey]: { ...set, cards: { ...set.cards, [cardId]: update(card) } },
    },
  }
}

export function recordAnswer(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardId: string,
  isCorrect: boolean,
  now = Date.now(),
): ProgressSnapshot {
  return updateCard(snapshot, setKey, cardId, now, (card) => ({
    ...card,
    attempts: card.attempts + 1,
    correct: card.correct + (isCorrect ? 1 : 0),
    incorrect: card.incorrect + (isCorrect ? 0 : 1),
    lastResult: isCorrect ? 'correct' : 'incorrect',
    lastSeenAt: now,
  }))
}

export function setMarked(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardId: string,
  marked: boolean,
  now = Date.now(),
): ProgressSnapshot {
  return updateCard(snapshot, setKey, cardId, now, (card) => ({ ...card, marked }))
}

/** Called when a learner reaches the results screen. */
export function completeSession(
  snapshot: ProgressSnapshot,
  setKey: string,
  now = Date.now(),
): ProgressSnapshot {
  const set = snapshot.sets[setKey] ?? emptySetProgress()
  return {
    ...snapshot,
    updatedAt: now,
    sets: {
      ...snapshot.sets,
      [setKey]: { ...set, lastSessionAt: now, sessionsCompleted: set.sessionsCompleted + 1 },
    },
  }
}

/** Clears one set's history, leaving every other set untouched. */
export function resetSet(
  snapshot: ProgressSnapshot,
  setKey: string,
  now = Date.now(),
): ProgressSnapshot {
  const { [setKey]: _removed, ...rest } = snapshot.sets
  return { ...snapshot, updatedAt: now, sets: rest }
}

// --- Derived views ---------------------------------------------------------

export function getSetProgress(snapshot: ProgressSnapshot, setKey: string): SetProgress {
  return snapshot.sets[setKey] ?? emptySetProgress()
}

export function getCardProgress(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardId: string,
): CardProgress {
  return getSetProgress(snapshot, setKey).cards[cardId] ?? emptyCardProgress()
}

/**
 * Review mode's eligibility rule: a card qualifies if its most recent attempt was
 * wrong, or the learner flagged it. Getting it right later removes it automatically
 * unless it is still flagged.
 */
export function isReviewable(card: CardProgress): boolean {
  return card.marked || card.lastResult === 'incorrect'
}

/**
 * Card ids eligible for review, in the order the set defines them. Cards missing from
 * progress (never attempted) are excluded — review is for revisiting, not discovering.
 */
export function reviewableCardIds(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardIds: string[],
): string[] {
  const set = getSetProgress(snapshot, setKey)
  return cardIds.filter((id) => {
    const card = set.cards[id]
    return card ? isReviewable(card) : false
  })
}

export function summarize(
  snapshot: ProgressSnapshot,
  setKey: string,
  cardIds: string[],
): SetProgressSummary {
  const set = getSetProgress(snapshot, setKey)

  let attempted = 0
  let correct = 0
  let missed = 0
  let marked = 0
  let reviewable = 0

  for (const id of cardIds) {
    const card = set.cards[id]
    if (!card) continue
    if (card.attempts > 0) {
      attempted += 1
      if (card.lastResult === 'correct') correct += 1
      if (card.lastResult === 'incorrect') missed += 1
    }
    if (card.marked) marked += 1
    if (isReviewable(card)) reviewable += 1
  }

  return {
    attempted,
    correct,
    missed,
    marked,
    reviewable,
    accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
    lastSessionAt: set.lastSessionAt,
  }
}

/**
 * Totals across every set. Derived from the snapshot alone — no card lists — so the
 * landing page can show progress without downloading a single card file.
 */
export function overallSummary(snapshot: ProgressSnapshot): {
  attempted: number
  correct: number
  reviewable: number
  accuracy: number
  setsStarted: number
} {
  let attempted = 0
  let correct = 0
  let reviewable = 0
  let setsStarted = 0

  for (const set of Object.values(snapshot.sets)) {
    let touched = false
    for (const card of Object.values(set.cards)) {
      if (card.attempts > 0) {
        attempted += 1
        touched = true
        if (card.lastResult === 'correct') correct += 1
      }
      if (isReviewable(card)) reviewable += 1
    }
    if (touched) setsStarted += 1
  }

  return {
    attempted,
    correct,
    reviewable,
    accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
    setsStarted,
  }
}

// --- localStorage adapter --------------------------------------------------

/**
 * Anything unreadable or from a future schema version is discarded rather than
 * migrated — progress is regenerable, and a half-understood document is worse than a
 * clean slate. A real migration goes here when schemaVersion 2 ships.
 */
function parseSnapshot(raw: string | null): ProgressSnapshot | null {
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const candidate = parsed as Partial<ProgressSnapshot>
    if (candidate.schemaVersion !== PROGRESS_SCHEMA_VERSION) return null
    if (typeof candidate.sets !== 'object' || candidate.sets === null) return null

    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      ownerId: typeof candidate.ownerId === 'string' ? candidate.ownerId : LOCAL_OWNER,
      updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
      sets: candidate.sets,
    }
  } catch {
    return null
  }
}

export function loadProgress(): ProgressSnapshot {
  if (typeof window === 'undefined') return emptySnapshot()
  try {
    return parseSnapshot(window.localStorage.getItem(STORAGE_KEY)) ?? emptySnapshot()
  } catch {
    // Private browsing or a blocked storage partition — run in-memory for the session.
    return emptySnapshot()
  }
}

export function saveProgress(snapshot: ProgressSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Quota exceeded or storage blocked. Progress stays in memory; nothing else breaks.
  }
}
