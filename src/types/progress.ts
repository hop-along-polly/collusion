/**
 * Persisted progress.
 *
 * The shape is deliberately server-shaped rather than localStorage-shaped: one
 * `ProgressSnapshot` document per owner, with monotonic per-card counters and an
 * `updatedAt` stamp. When accounts land, the same document can be PUT to an API and
 * merged field-wise (counters add, `marked` ORs, `lastSeenAt` takes the max) without
 * a migration or a rewrite of the reading code. See ARCHITECTURE.md → "Freemium path".
 */

export const PROGRESS_SCHEMA_VERSION = 1

/** Owner id used before authentication exists. */
export const LOCAL_OWNER = 'local'

export type CardResult = 'correct' | 'incorrect'

export interface CardProgress {
  /** Total times this card has been answered. */
  attempts: number
  correct: number
  incorrect: number
  /** Result of the most recent attempt; drives review-mode eligibility. */
  lastResult: CardResult | null
  /** Epoch millis of the most recent attempt. */
  lastSeenAt: number
  /** Learner explicitly flagged this card. */
  marked: boolean
}

export interface SetProgress {
  /** Keyed by card id. Cards never answered are simply absent. */
  cards: Record<string, CardProgress>
  /** Epoch millis of the last session in this set, or null if never started. */
  lastSessionAt: number | null
  /** Sessions carried through to the results screen. */
  sessionsCompleted: number
}

export interface ProgressSnapshot {
  schemaVersion: typeof PROGRESS_SCHEMA_VERSION
  /** `LOCAL_OWNER` today; a real user id once accounts exist. */
  ownerId: string
  /** Epoch millis — the merge key for future server sync. */
  updatedAt: number
  /** Keyed by fully-qualified set id (`<domainId>/<setId>`). */
  sets: Record<string, SetProgress>
}

/** Aggregated view of one set's progress, for dashboards and set cards. */
export interface SetProgressSummary {
  /** Cards with at least one attempt. */
  attempted: number
  /** Cards whose most recent attempt was correct. */
  correct: number
  /** Cards whose most recent attempt was incorrect. */
  missed: number
  marked: number
  /** Cards eligible for review mode: missed OR marked. */
  reviewable: number
  /** 0-100, rounded, over attempted cards; 0 when nothing attempted. */
  accuracy: number
  lastSessionAt: number | null
}
