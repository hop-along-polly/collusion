/**
 * The catalog is the only eagerly-loaded data. It is small (a few hundred bytes per
 * set) and lets every index screen render without touching a card file. Card bodies
 * are fetched lazily and code-split per set — see `loader.ts`.
 */

import catalogJson from '../../catalog.json'
import type { CardSetMeta, Catalog, CourseMeta, DomainMeta } from '../types/cards'
import { formatIssues, validateCatalog } from './validate'

const result = validateCatalog(catalogJson)

if (!result.value) {
  // Unreachable in a released build: `npm run validate:data` gates `npm run build`.
  throw new Error(`catalog.json is invalid:\n${formatIssues(result.issues)}`)
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

export function listCourses(domainId?: string): CourseMeta[] {
  return catalog.courses.filter((course) => !domainId || course.domainId === domainId)
}

export function findCourse(domainId: string, courseId: string): CourseMeta | undefined {
  return catalog.courses.find((course) => course.domainId === domainId && course.id === courseId)
}

/**
 * The sets a course quizzes, in the order its study guide lists them. `setIds` is
 * validated against the catalog at build time, so a miss here would mean the gate was
 * bypassed — hence filtering rather than throwing.
 */
export function courseSets(course: CourseMeta): CardSetMeta[] {
  return course.setIds
    .map((setId) => findSet(course.domainId, setId))
    .filter((set): set is CardSetMeta => Boolean(set))
}

/** Courses whose study guide links a given note, used to cross-link from a note page. */
export function coursesForNote(noteFile: string): CourseMeta[] {
  const setsCiting = catalog.sets.filter((set) => set.sources.includes(noteFile))
  return catalog.courses.filter((course) =>
    setsCiting.some((set) => course.domainId === set.domainId && course.setIds.includes(set.id)),
  )
}

export function totalCardCount(): number {
  return catalog.sets.reduce((total, set) => total + set.cardCount, 0)
}
