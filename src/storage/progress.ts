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
  type CourseProgress,
  type CourseProgressSummary,
} from '@/types/progress'

export const STORAGE_KEY = 'scribe-cards.progress.v2'

export function emptySnapshot(now = Date.now()): ProgressSnapshot {
  return {
    schemaVersion: PROGRESS_SCHEMA_VERSION,
    ownerId: LOCAL_OWNER,
    updatedAt: now,
    courses: {},
  }
}

function emptyCourseProgress(): CourseProgress {
  return { cards: {}, lastSessionAt: null, sessionsCompleted: 0 }
}

function emptyCardProgress(): CardProgress {
  return { attempts: 0, correct: 0, incorrect: 0, lastResult: null, lastSeenAt: 0, marked: false }
}

// --- Pure updates ----------------------------------------------------------

function updateCard(
  snapshot: ProgressSnapshot,
  courseKey: string,
  cardId: string,
  now: number,
  update: (card: CardProgress) => CardProgress,
): ProgressSnapshot {
  const set = snapshot.courses[courseKey] ?? emptyCourseProgress()
  const card = set.cards[cardId] ?? emptyCardProgress()

  return {
    ...snapshot,
    updatedAt: now,
    courses: {
      ...snapshot.courses,
      [courseKey]: { ...set, cards: { ...set.cards, [cardId]: update(card) } },
    },
  }
}

export function recordAnswer(
  snapshot: ProgressSnapshot,
  courseKey: string,
  cardId: string,
  isCorrect: boolean,
  now = Date.now(),
): ProgressSnapshot {
  return updateCard(snapshot, courseKey, cardId, now, (card) => ({
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
  courseKey: string,
  cardId: string,
  marked: boolean,
  now = Date.now(),
): ProgressSnapshot {
  return updateCard(snapshot, courseKey, cardId, now, (card) => ({ ...card, marked }))
}

/** Called when a learner reaches the results screen. */
export function completeSession(
  snapshot: ProgressSnapshot,
  courseKey: string,
  now = Date.now(),
): ProgressSnapshot {
  const set = snapshot.courses[courseKey] ?? emptyCourseProgress()
  return {
    ...snapshot,
    updatedAt: now,
    courses: {
      ...snapshot.courses,
      [courseKey]: { ...set, lastSessionAt: now, sessionsCompleted: set.sessionsCompleted + 1 },
    },
  }
}

/** Clears one set's history, leaving every other set untouched. */
export function resetCourse(
  snapshot: ProgressSnapshot,
  courseKey: string,
  now = Date.now(),
): ProgressSnapshot {
  const { [courseKey]: _removed, ...rest } = snapshot.courses
  return { ...snapshot, updatedAt: now, courses: rest }
}

// --- Derived views ---------------------------------------------------------

export function getCourseProgress(snapshot: ProgressSnapshot, courseKey: string): CourseProgress {
  return snapshot.courses[courseKey] ?? emptyCourseProgress()
}

export function getCardProgress(
  snapshot: ProgressSnapshot,
  courseKey: string,
  cardId: string,
): CardProgress {
  return getCourseProgress(snapshot, courseKey).cards[cardId] ?? emptyCardProgress()
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
 * progress (never attempted) are excluded - review is for revisiting, not discovering.
 */
export function reviewableCardIds(
  snapshot: ProgressSnapshot,
  courseKey: string,
  cardIds: string[],
): string[] {
  const set = getCourseProgress(snapshot, courseKey)
  return cardIds.filter((id) => {
    const card = set.cards[id]
    return card ? isReviewable(card) : false
  })
}

export function summarize(
  snapshot: ProgressSnapshot,
  courseKey: string,
  cardIds: string[],
): CourseProgressSummary {
  const set = getCourseProgress(snapshot, courseKey)

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
 * Totals across every set. Derived from the snapshot alone - no card lists - so the
 * landing page can show progress without downloading a single card file.
 */
export function overallSummary(snapshot: ProgressSnapshot): {
  attempted: number
  correct: number
  reviewable: number
  accuracy: number
  coursesStarted: number
} {
  let attempted = 0
  let correct = 0
  let reviewable = 0
  let coursesStarted = 0

  for (const course of Object.values(snapshot.courses)) {
    let touched = false
    for (const card of Object.values(course.cards)) {
      if (card.attempts > 0) {
        attempted += 1
        touched = true
        if (card.lastResult === 'correct') correct += 1
      }
      if (isReviewable(card)) reviewable += 1
    }
    if (touched) coursesStarted += 1
  }

  return {
    attempted,
    correct,
    reviewable,
    accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
    coursesStarted,
  }
}

// --- localStorage adapter --------------------------------------------------

/**
 * Anything unreadable or from a future schema version is discarded rather than
 * migrated - progress is regenerable, and a half-understood document is worse than a
 * clean slate. A real migration goes here when schemaVersion 2 ships.
 */
function parseSnapshot(raw: string | null): ProgressSnapshot | null {
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const candidate = parsed as Partial<ProgressSnapshot>
    if (candidate.schemaVersion !== PROGRESS_SCHEMA_VERSION) return null
    if (typeof candidate.courses !== 'object' || candidate.courses === null) return null

    return {
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      ownerId: typeof candidate.ownerId === 'string' ? candidate.ownerId : LOCAL_OWNER,
      updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
      courses: candidate.courses,
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
    // Private browsing or a blocked storage partition - run in-memory for the session.
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
