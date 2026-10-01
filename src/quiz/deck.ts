/**
 * A deck is what a quiz session runs over: one course, drawing on every card set its
 * study guide lists.
 *
 * Flashcards are only ever launched from a course, and results are stored per course.
 * That is deliberate - two courses in the same domain can list the same set, so a card
 * can be tested by more than one certification, and how ready you are for one exam says
 * nothing about the other. Keying progress by course keeps those histories independent.
 */

import type { Card, CardSet, CardSetMeta, CourseMeta } from '@/types/cards'

export interface Deck {
  /** Progress storage key - the course path, e.g. `aws/aif-c01`. */
  progressKey: string
  title: string
  /** Where the back-link points, and what it says. */
  backTo: string
  backLabel: string
  /** Route base for this quiz, so switching modes keeps the same page. */
  quizPath: string
  /**
   * Every card the course can draw on, with its own id intact - which is also its
   * storage id. Safe because a course only draws sets from its own domain and the build
   * gate enforces that card ids are unique within a domain, so no two cards in one
   * session can collide.
   */
  cards: Card[]
  /**
   * Cap on a practice session. A course union runs to a couple of hundred cards, which
   * is several sittings rather than one.
   */
  sessionLimit: number
}

export interface CourseDeckEntry {
  meta: CardSetMeta
  set: CardSet
}

export function buildCourseDeck(
  course: CourseMeta,
  entries: CourseDeckEntry[],
  sessionLimit: number,
): Deck {
  const cards = entries.flatMap((entry) => entry.set.cards)

  return {
    progressKey: course.path,
    title: course.title,
    backTo: `/courses/${course.path}`,
    backLabel: course.title,
    quizPath: `/courses/${course.path}/quiz`,
    cards,
    sessionLimit,
  }
}
