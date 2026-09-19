/**
 * The catalog is the only eagerly-loaded data. It is small (a few hundred bytes per
 * set) and lets every index screen render without touching a card file. Card bodies
 * are fetched lazily and code-split per set — see `loader.ts`.
 */

import catalogJson from '../../data/catalog.json'
import type { CardSetMeta, Catalog, DomainMeta } from '../types/cards'
import { formatIssues, validateCatalog } from './validate'

const result = validateCatalog(catalogJson)

if (!result.value) {
  // Unreachable in a released build: `npm run validate:data` gates `npm run build`.
  throw new Error(`data/catalog.json is invalid:\n${formatIssues(result.issues)}`)
}

export const catalog: Catalog = result.value

export function listDomains(): DomainMeta[] {
  return catalog.domains
}

export function findDomain(domainId: string): DomainMeta | undefined {
  return catalog.domains.find((domain) => domain.id === domainId)
}

export function listSets(domainId: string): CardSetMeta[] {
  return catalog.sets.filter((set) => set.domainId === domainId)
}

export function findSet(domainId: string, setId: string): CardSetMeta | undefined {
  return catalog.sets.find((set) => set.domainId === domainId && set.id === setId)
}

export function totalCardCount(): number {
  return catalog.sets.reduce((total, set) => total + set.cardCount, 0)
}
