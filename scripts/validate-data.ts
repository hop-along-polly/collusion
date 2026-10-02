/**
 * Data integrity gate. Runs before every build (`npm run build`) and on demand
 * (`npm run validate:data`).
 *
 * Shape validation is shared with the app via `src/data/validate.ts`. This script adds
 * the checks that need the filesystem:
 *
 *  - every card set on disk is registered in the catalog, and vice versa
 *  - `cardCount` in the catalog matches the card file
 *  - every cited note file exists
 *  - every cited `heading` is a real Markdown heading in that file (so the deep link
 *    resolves), and every cited `section` label actually appears in it
 *  - no study guide links a card set path, which has no route and so renders the
 *    not-found page
 *
 * The point is that a card can never quietly drift from the notes it claims to cite.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Card, CardSetMeta, Citation } from '../src/types/cards'
import { formatIssues, hasErrors, validateCards, validateCatalog } from '../src/data/validate'
import type { Issue } from '../src/data/validate'

const repoRoot = resolve(fileURLToPath(new URL('../', import.meta.url)))
const cardsRoot = join(repoRoot, 'flashcards')

const issues: Issue[] = []

function error(path: string, message: string): void {
  issues.push({ path, message, severity: 'error' })
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function exists(path: string): boolean {
  try {
    statSync(path)
    return true
  } catch {
    return false
  }
}

/**
 * GitHub's heading-anchor slug: lowercase, drop anything that is not a word
 * character, space or hyphen, then replace spaces with hyphens.
 */
export function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Markdown headings, ignoring `#` lines inside fenced code blocks.
 *
 * Only ever called for `.md` files. In a source file - `ai_react_loop.py`, say - every
 * `#` comment looks like a heading, so treating a non-Markdown file as Markdown would
 * invent anchors that GitHub never generates.
 */
function extractHeadings(markdown: string): string[] {
  const headings: string[] = []
  let inFence = false

  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^#{1,6}\s+(.*\S)\s*$/.exec(line)
    if (match?.[1]) headings.push(match[1])
  }

  return headings
}

/** Card files discovered on disk, as `<domain>/<set>` paths (minus the `.json`). */
function discoverCardSetPaths(): string[] {
  const found: string[] = []
  for (const domain of readdirSync(cardsRoot)) {
    const domainPath = join(cardsRoot, domain)
    if (!statSync(domainPath).isDirectory()) continue
    for (const entry of readdirSync(domainPath)) {
      if (!entry.endsWith('.json')) continue
      found.push(`${domain}/${entry.slice(0, -'.json'.length)}`)
    }
  }
  return found.sort()
}

const noteCache = new Map<string, { headings: Set<string>; text: string } | null>()

function readNote(file: string): { headings: Set<string>; text: string } | null {
  if (noteCache.has(file)) return noteCache.get(file) ?? null

  const notePath = join(repoRoot, file)
  if (!exists(notePath)) {
    noteCache.set(file, null)
    return null
  }

  const text = readFileSync(notePath, 'utf8')
  // Non-Markdown notes (the example `.py` scripts) have no headings and therefore no
  // anchors - every citation into one has to be a `section`.
  const headings = file.toLowerCase().endsWith('.md') ? extractHeadings(text) : []
  const parsed = { headings: new Set(headings), text }
  noteCache.set(file, parsed)
  return parsed
}

function checkCitation(citation: Citation, at: string): void {
  const note = readNote(citation.file)
  if (!note) {
    error(`${at}.file`, `note file "${citation.file}" does not exist in the repository`)
    return
  }

  if (citation.heading) {
    if (!citation.file.toLowerCase().endsWith('.md')) {
      error(
        `${at}.heading`,
        `${citation.file} is not Markdown, so it has no anchors - use "section" instead of "heading".`,
      )
    } else if (!note.headings.has(citation.heading)) {
      const label = note.headings.has(citation.heading.trim()) ? ' (check whitespace)' : ''
      error(
        `${at}.heading`,
        `"${citation.heading}" is not a Markdown heading in ${citation.file}${label}. ` +
          `If it is a labelled region rather than a heading, use "section" instead.`,
      )
    }
  }

  if (citation.section) {
    if (note.headings.has(citation.section)) {
      error(
        `${at}.section`,
        `"${citation.section}" IS a Markdown heading in ${citation.file} - use "heading" so the citation deep-links.`,
      )
    } else if (!note.text.includes(citation.section)) {
      error(`${at}.section`, `"${citation.section}" does not appear anywhere in ${citation.file}`)
    }
  }

  if (!citation.heading && !citation.section) {
    issues.push({
      path: at,
      message: 'cites a whole file; naming a heading or section makes the card easier to verify',
      severity: 'warning',
    })
  }
}

function checkCards(cards: Card[], meta: CardSetMeta): void {
  cards.forEach((card, index) => {
    card.citations.forEach((citation, citationIndex) => {
      checkCitation(citation, `${meta.path}.cards[${index}](${card.id}).citations[${citationIndex}]`)
    })
  })
}

// --- 1. Catalog ------------------------------------------------------------

const catalogPath = join(repoRoot, 'catalog.json')
if (!exists(catalogPath)) {
  console.error(`✗ missing ${relative(repoRoot, catalogPath)}`)
  process.exit(1)
}

const catalogResult = validateCatalog(readJson(catalogPath))
issues.push(...catalogResult.issues)

if (!catalogResult.value) {
  console.error(`\n✗ catalog.json is invalid:\n${formatIssues(issues)}\n`)
  process.exit(1)
}

const catalog = catalogResult.value

// --- 2. Catalog <-> disk ---------------------------------------------------

const onDisk = new Set(discoverCardSetPaths())
const registered = new Set(catalog.sets.map((set) => set.path))

for (const path of onDisk) {
  if (!registered.has(path)) {
    error(`flashcards/${path}.json`, 'card file exists but is not registered in catalog.json')
  }
}
for (const path of registered) {
  if (!onDisk.has(path)) {
    error(`catalog.sets[${path}]`, `registered in the catalog but flashcards/${path}.json is missing`)
  }
}

// --- 3. Each card file -----------------------------------------------------

let totalCards = 0

/**
 * Card ids must be unique within a domain, because progress is stored per course and a
 * course only draws sets from its own domain. Two sets in one domain naming a card
 * identically would make one card's history indistinguishable from the other's - and
 * usually means the same fact is carded twice.
 */
const idsByDomain = new Map<string, Map<string, string>>()

for (const meta of catalog.sets) {
  const cardPath = join(cardsRoot, `${meta.path}.json`)
  if (!exists(cardPath)) continue

  const file = readJson(cardPath) as { id?: string; cards?: unknown }

  if (file.id !== meta.id) {
    error(`flashcards/${meta.path}.json.id`, `expected "${meta.id}" to match the catalog, got "${file.id}"`)
  }

  const result = validateCards(file.cards, `flashcards/${meta.path}.json.cards`)
  issues.push(...result.issues)
  if (!result.value) continue

  if (result.value.length !== meta.cardCount) {
    error(
      `catalog.sets[${meta.path}].cardCount`,
      `says ${meta.cardCount} but the file holds ${result.value.length}`,
    )
  }

  const claimed = idsByDomain.get(meta.domainId) ?? new Map<string, string>()
  for (const card of result.value) {
    const owner = claimed.get(card.id)
    if (owner) {
      error(
        `flashcards/${meta.path}.json`,
        `card id "${card.id}" is already used by ${owner}. Ids must be unique within the ` +
          `"${meta.domainId}" domain, because progress is stored per course and a course ` +
          `draws only on sets from one domain.`,
      )
    } else {
      claimed.set(card.id, `flashcards/${meta.path}.json`)
    }
  }
  idsByDomain.set(meta.domainId, claimed)

  checkCards(result.value, meta)
  totalCards += result.value.length

  for (const source of meta.sources) {
    if (!exists(join(repoRoot, source))) {
      error(`catalog.sets[${meta.path}].sources`, `source note "${source}" does not exist`)
    }
  }
}

// --- 4. Courses ------------------------------------------------------------
// A course is a study guide plus the sets it quizzes. The guide has to exist on disk,
// and every note it links has to resolve, or the course page renders dead links.

for (const course of catalog.courses) {
  const guidePath = join(repoRoot, 'courses', `${course.path}.md`)
  if (!exists(guidePath)) {
    error(`catalog.courses[${course.path}]`, `study guide courses/${course.path}.md is missing`)
    continue
  }

  const guide = readFileSync(guidePath, 'utf8')
  // Relative Markdown links out of courses/<domain>/ into the notes tree.
  for (const [, target] of guide.matchAll(/\]\((\.\.\/\.\.\/notes\/[^)\s]+)\)/g)) {
    const noteRelative = target.replace(/^(\.\.\/)+/, '')
    if (!exists(join(repoRoot, noteRelative))) {
      error(`courses/${course.path}.md`, `links to "${target}" but ${noteRelative} does not exist`)
    }
  }

  // A card set has no page. Sessions launch from a course, because results are recorded per
  // certification, so `/<domain>/<set-id>` matches no route and renders the not-found page.
  // 47 such links accumulated across six guides before anyone noticed, which is how a link
  // that only ever fails behaves: nothing complains, because nothing checks.
  for (const [, label, target] of guide.matchAll(/\[([^\]]+)\]\((\/[^)\s]+)\)/g)) {
    if (registered.has(target.replace(/^\//, ''))) {
      error(
        `courses/${course.path}.md`,
        `links "${label}" to the card set path "${target}", which has no route - name the set in plain text instead`,
      )
    }
  }
}

// --- 5. Report -------------------------------------------------------------

const errors = issues.filter((issue) => issue.severity === 'error')
const warnings = issues.filter((issue) => issue.severity === 'warning')

if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):\n${formatIssues(warnings)}`)
}

if (hasErrors(issues)) {
  console.error(`\n✗ ${errors.length} error(s):\n${formatIssues(errors)}\n`)
  process.exit(1)
}

const planned = catalog.domains.filter((domain) => domain.status === 'planned').map((d) => d.id)
console.log(
  `✓ data ok - ${catalog.courses.length} course(s), ${catalog.sets.length} card set(s), ` +
    `${totalCards} cards, ${catalog.domains.length} domain(s)` +
    `${planned.length ? ` (planned: ${planned.join(', ')})` : ''}`,
)
