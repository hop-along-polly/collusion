/**
 * Card-set loading.
 *
 * `import.meta.glob` discovers every `/flashcards/<domain>/<set>.json` at build time
 * and emits one lazy chunk per file, so a learner only downloads the set they open.
 * Adding a set is therefore a data-only change: drop in the JSON file and register it
 * in `catalog.json`.
 */

import type { CardSet, CardSetMeta } from '../types/cards'
import { formatIssues, validateCards } from './validate'

interface CardFileModule {
  default: { cards: unknown }
}

/** Keyed by absolute path, e.g. `/flashcards/anthropic/claude-api.json`. */
const cardFiles = import.meta.glob<CardFileModule>('/flashcards/*/*.json')

export class CardSetNotFoundError extends Error {
  constructor(path: string) {
    super(`No card file found at /flashcards/${path}.json`)
    this.name = 'CardSetNotFoundError'
  }
}

export class CardSetInvalidError extends Error {
  constructor(path: string, details: string) {
    super(`Card file /flashcards/${path}.json is invalid:\n${details}`)
    this.name = 'CardSetInvalidError'
  }
}

/** Resolved sets are memoised - re-entering a set is instant after the first visit. */
const cache = new Map<string, CardSet>()

export async function loadCardSet(meta: CardSetMeta): Promise<CardSet> {
  const cached = cache.get(meta.path)
  if (cached) return cached

  const importCardFile = cardFiles[`/flashcards/${meta.path}.json`]
  if (!importCardFile) throw new CardSetNotFoundError(meta.path)

  const module = await importCardFile()
  const { value, issues } = validateCards(module.default?.cards, `${meta.path}.cards`)
  if (!value) throw new CardSetInvalidError(meta.path, formatIssues(issues))

  if (import.meta.env.DEV && issues.length > 0) {
    console.warn(`[cards] warnings in /flashcards/${meta.path}.json:\n${formatIssues(issues)}`)
  }

  const set: CardSet = { ...meta, cards: value }
  cache.set(meta.path, set)
  return set
}
