/**
 * A deck is whatever a quiz session runs over.
 *
 * Two things can be quizzed: a single card set, and a course — the union of every set
 * its study guide lists. They differ only in where the cards come from and where an
 * answer gets recorded, so both are expressed as a `Deck` and run by the same component.
 *
 * The awkward part a deck exists to absorb: card ids are unique *within* a set but not
 * across sets, while progress is stored per set. A course session therefore renames its
 * cards to keep them distinct, and `originOf` maps a session card back to the set and id
 * its result belongs to.
 */

import type { Card, CardSet, CardSetMeta, CourseMeta } from '@/types/cards'

/** Where a session card's result is stored: which set, under which original id. */
export interface CardOrigin {
  /** The progress storage key — a set's `path`, e.g. `aws/ai-practitioner-aws`. */
  setKey: string
  /** The card's own id within that set. */
  cardId: string
}

export interface Deck {
  /** Session label, also the reducer's `setId`. Not a storage key. */
  id: string
  title: string
  /** Where the back-link points, and what it says. */
  backTo: string
  backLabel: string
  /** Route base for this quiz, so switching modes keeps the same page. */
  quizPath: string
  cards: Card[]
  originOf: (sessionCardId: string) => CardOrigin | undefined
  /** Every set the deck draws from. All are marked complete when a session ends. */
  setKeys: string[]
  /**
   * Cap on a practice session, or `undefined` to run every card. A course union can
   * reach a couple of hundred cards, which is several sittings rather than one.
   */
  sessionLimit?: number
}

export function buildSetDeck(domainId: string, meta: CardSetMeta, set: CardSet): Deck {
  const origin = (cardId: string): CardOrigin => ({ setKey: meta.path, cardId })

  return {
    id: meta.path,
    title: meta.title,
    backTo: `/${domainId}/${meta.id}`,
    backLabel: meta.title,
    quizPath: `/${domainId}/${meta.id}/quiz`,
    cards: set.cards,
    // A single-set deck never renames its cards, so the id is already the origin id.
    originOf: (sessionCardId) => origin(sessionCardId),
    setKeys: [meta.path],
  }
}

/** Separator for namespaced ids. Not a legal character in a card id, which is kebab-case. */
const NAMESPACE = '::'

export interface CourseDeckEntry {
  meta: CardSetMeta
  set: CardSet
}

/**
 * The union of a course's sets.
 *
 * Cards are renamed to `<setKey>::<cardId>` for the session. Today no two sets share a
 * card id, but nothing enforces that — two independently generated sets could easily
 * both name a card `rag-vs-fine-tuning`, and the collision would silently file one
 * card's result against the other's set.
 */
export function buildCourseDeck(course: CourseMeta, entries: CourseDeckEntry[], limit: number): Deck {
  const origins = new Map<string, CardOrigin>()
  const cards: Card[] = []

  for (const { meta, set } of entries) {
    for (const card of set.cards) {
      const sessionId = `${meta.path}${NAMESPACE}${card.id}`
      origins.set(sessionId, { setKey: meta.path, cardId: card.id })
      cards.push({ ...card, id: sessionId })
    }
  }

  return {
    id: `course:${course.path}`,
    title: course.title,
    backTo: `/courses/${course.path}`,
    backLabel: course.title,
    quizPath: `/courses/${course.path}/quiz`,
    cards,
    originOf: (sessionCardId) => origins.get(sessionCardId),
    setKeys: entries.map((entry) => entry.meta.path),
    sessionLimit: limit,
  }
}

/**
 * Cards grouped by the set they came from, as pairs of session id and origin id.
 * Both the review filter and the starting marks need this, because progress is queried
 * one set at a time.
 */
export function groupBySet(deck: Deck): Map<string, { sessionId: string; cardId: string }[]> {
  const grouped = new Map<string, { sessionId: string; cardId: string }[]>()

  for (const card of deck.cards) {
    const origin = deck.originOf(card.id)
    if (!origin) continue
    const bucket = grouped.get(origin.setKey)
    const entry = { sessionId: card.id, cardId: origin.cardId }
    if (bucket) bucket.push(entry)
    else grouped.set(origin.setKey, [entry])
  }

  return grouped
}
