/**
 * Runtime validation for card data.
 *
 * Pure TypeScript with no dependencies so it can run in three places: the build
 * gate (`npm run validate:data`), the dev-time loader (a malformed file should
 * produce a readable error, not a blank screen), and unit tests.
 */

// Relative (not aliased) so the Node-based build gate can import this module directly.
import type { Card, CardSetMeta, Catalog, CourseMeta, DomainMeta } from '../types/cards'

export interface Issue {
  /** Dotted path to the offending value, e.g. `cards[3].options[1].id`. */
  path: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult<T> {
  value: T | null
  issues: Issue[]
}

const CARD_TYPES = new Set(['single', 'multi', 'boolean'])
const DOMAIN_STATUSES = new Set(['available', 'planned'])
const DOMAIN_ICONS = new Set(['sparkles', 'cloud', 'workflow', 'terminal'])
const COURSE_KINDS = new Set(['certification', 'track'])

/**
 * Options that let a learner shortcut the question rather than reason about it.
 * Flagged, not rejected - a source note could genuinely support one.
 */
const LAZY_OPTION_PATTERN = /^(all|none) of the above$/i

/**
 * Phrases that talk *about the source note* instead of about the subject.
 *
 * A card has to stand on its own. "The notes look it up in Python's `globals()`"
 * fails twice over: it makes the learner recall a document rather than a fact, and
 * it elevates one example's implementation detail into the general rule. The citation
 * panel already says where an answer came from, so the prose never needs to.
 *
 * Deliberately narrow. Plenty of neighbouring words are legitimate subject
 * vocabulary - a RAG *document*, a `DocumentBlock`, Parallelization *sectioning*,
 * "thoroughly *document* your tools" - so only document-reference phrasings match.
 */
const META_REFERENCE_PATTERNS: [RegExp, string][] = [
  [/\bthe notes?\b/i, 'refers to the source note instead of stating the fact'],
  [/\bnotes['’]/i, 'refers to the source note instead of stating the fact'],
  [/\b(?:per|according to) the note/i, 'attributes the fact to a document'],
  [/\bthis document\b/i, 'refers to the source note instead of stating the fact'],
  [/\bthe material\b/i, 'refers to the source note instead of stating the fact'],
  [/\bcheat ?sheet\b/i, 'refers to the source note instead of stating the fact'],
  // "the Variables section", "this section", "the Model Based Grading section"
  [/\b(?:the|this|that)\s+(?:\S+\s+){0,3}sections?\b/i, 'refers to a heading in the source note'],
]

/**
 * A scenario followed by a stub: "...wants to keep its existing manifests. Which service?"
 *
 * The question has to carry the ask, because a learner reads the stem under time pressure
 * and a two-word question makes them re-read the scenario to work out what is even being
 * asked. Restating the requirement in the question costs a few words and removes that
 * re-read: "Which AWS service lets them keep both?"
 *
 * Only applies when something precedes the question. A short question that is the whole
 * prompt is already self-contained, so "What is a Subagent?" is fine.
 */
function checkStubQuestion(prompt: string, at: string, issues: Issue[]): void {
  const sentences = prompt.trim().split(/(?<=[.?!])\s+/)
  if (sentences.length < 2) return

  const question = (sentences.at(-1) ?? '').trim()
  if (!question.endsWith('?')) return

  const words = question.replace(/\?+$/, '').split(/\s+/).filter(Boolean)
  if (words.length > STUB_QUESTION_MAX_WORDS) return

  issues.push({
    path: at,
    message: `the closing question "${question}" leans on the sentence before it - restate what is being asked`,
    severity: 'error',
  })
}

/** Below this, a closing question is not carrying the ask on its own. */
const STUB_QUESTION_MAX_WORDS = 4

/** Card text that must read as a standalone statement about the subject. */
function checkMetaReferences(raw: Record<string, unknown>, at: string, issues: Issue[]): void {
  const fields: [string, unknown][] = [
    [`${at}.prompt`, raw.prompt],
    [`${at}.explanation`, raw.explanation],
  ]

  if (Array.isArray(raw.options)) {
    raw.options.forEach((option, index) => {
      if (isRecord(option) && option.rationale !== undefined) {
        fields.push([`${at}.options[${index}].rationale`, option.rationale])
      }
    })
  }

  for (const [path, value] of fields) {
    if (typeof value !== 'string') continue
    for (const [pattern, message] of META_REFERENCE_PATTERNS) {
      const match = pattern.exec(value)
      if (match) {
        issues.push({ path, message: `"${match[0].trim()}" ${message}`, severity: 'error' })
        break
      }
    }
  }
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((issue) => issue.severity === 'error')
}

export function formatIssues(issues: Issue[]): string {
  return issues
    .map((issue) => `  ${issue.severity === 'error' ? '✗' : '!'} ${issue.path}: ${issue.message}`)
    .join('\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** The raw shape of a `cards.json` file: metadata overrides plus the cards. */
export interface RawCardSetFile {
  id?: string
  title?: string
  cards: unknown
}

/**
 * Validate the `cards` array of a set file.
 *
 * Shape rules mirror the content brief:
 *  - `boolean` cards have exactly two options (True/False) and exactly one correct.
 *  - `single` cards have exactly four options and exactly one correct.
 *  - `multi` cards have at least four options and at least one correct.
 *  - Every card cites at least one note file.
 */
export function validateCards(input: unknown, basePath = 'cards'): ValidationResult<Card[]> {
  const issues: Issue[] = []

  if (!Array.isArray(input)) {
    issues.push({ path: basePath, message: 'expected an array of cards', severity: 'error' })
    return { value: null, issues }
  }

  if (input.length === 0) {
    issues.push({ path: basePath, message: 'card set is empty', severity: 'error' })
  }

  const seenCardIds = new Set<string>()

  input.forEach((raw, cardIndex) => {
    const at = `${basePath}[${cardIndex}]`

    if (!isRecord(raw)) {
      issues.push({ path: at, message: 'expected an object', severity: 'error' })
      return
    }

    if (!isNonEmptyString(raw.id)) {
      issues.push({ path: `${at}.id`, message: 'missing or empty', severity: 'error' })
    } else if (seenCardIds.has(raw.id)) {
      issues.push({ path: `${at}.id`, message: `duplicate card id "${raw.id}"`, severity: 'error' })
    } else {
      seenCardIds.add(raw.id)
    }

    const type = raw.type
    if (typeof type !== 'string' || !CARD_TYPES.has(type)) {
      issues.push({
        path: `${at}.type`,
        message: `expected one of ${[...CARD_TYPES].join(', ')}`,
        severity: 'error',
      })
    }

    if (!isNonEmptyString(raw.prompt)) {
      issues.push({ path: `${at}.prompt`, message: 'missing or empty', severity: 'error' })
    } else {
      checkStubQuestion(raw.prompt, `${at}.prompt`, issues)
    }

    if (!isNonEmptyString(raw.explanation)) {
      issues.push({
        path: `${at}.explanation`,
        message: 'every card must explain its answer',
        severity: 'error',
      })
    }

    validateCitations(raw.citations, `${at}.citations`, issues)
    validateOptions(raw.options, type, `${at}.options`, issues)
    checkMetaReferences(raw, at, issues)

    if (raw.tags !== undefined) {
      if (!Array.isArray(raw.tags) || raw.tags.some((tag) => !isNonEmptyString(tag))) {
        issues.push({
          path: `${at}.tags`,
          message: 'expected an array of non-empty strings',
          severity: 'error',
        })
      }
    }
  })

  return { value: hasErrors(issues) ? null : (input as Card[]), issues }
}

function validateCitations(input: unknown, at: string, issues: Issue[]): void {
  if (!Array.isArray(input) || input.length === 0) {
    issues.push({
      path: at,
      message: 'at least one citation is required - cards must be traceable to the notes',
      severity: 'error',
    })
    return
  }

  input.forEach((raw, index) => {
    const path = `${at}[${index}]`
    if (!isRecord(raw)) {
      issues.push({ path, message: 'expected an object', severity: 'error' })
      return
    }
    if (!isNonEmptyString(raw.file)) {
      issues.push({ path: `${path}.file`, message: 'missing or empty', severity: 'error' })
    }
    for (const key of ['heading', 'section', 'anchor'] as const) {
      if (raw[key] !== undefined && !isNonEmptyString(raw[key])) {
        issues.push({ path: `${path}.${key}`, message: 'expected a non-empty string', severity: 'error' })
      }
    }
    if (raw.heading !== undefined && raw.section !== undefined) {
      issues.push({
        path,
        message:
          'set `heading` (a real Markdown heading, deep-linkable) or `section` (a label that is not a heading), not both',
        severity: 'error',
      })
    }
  })
}

function validateOptions(input: unknown, type: unknown, at: string, issues: Issue[]): void {
  if (!Array.isArray(input)) {
    issues.push({ path: at, message: 'expected an array of options', severity: 'error' })
    return
  }

  const seenOptionIds = new Set<string>()
  let correctCount = 0

  input.forEach((raw, index) => {
    const path = `${at}[${index}]`
    if (!isRecord(raw)) {
      issues.push({ path, message: 'expected an object', severity: 'error' })
      return
    }

    if (!isNonEmptyString(raw.id)) {
      issues.push({ path: `${path}.id`, message: 'missing or empty', severity: 'error' })
    } else if (seenOptionIds.has(raw.id)) {
      issues.push({ path: `${path}.id`, message: `duplicate option id "${raw.id}"`, severity: 'error' })
    } else {
      seenOptionIds.add(raw.id)
    }

    if (!isNonEmptyString(raw.text)) {
      issues.push({ path: `${path}.text`, message: 'missing or empty', severity: 'error' })
    } else if (LAZY_OPTION_PATTERN.test(raw.text.trim())) {
      issues.push({
        path: `${path}.text`,
        message: '"all/none of the above" weakens the question - prefer a concrete distractor',
        severity: 'warning',
      })
    }

    if (typeof raw.correct !== 'boolean') {
      issues.push({ path: `${path}.correct`, message: 'expected a boolean', severity: 'error' })
    } else if (raw.correct) {
      correctCount += 1
    }

    if (raw.rationale !== undefined && !isNonEmptyString(raw.rationale)) {
      issues.push({ path: `${path}.rationale`, message: 'expected a non-empty string', severity: 'error' })
    }
  })

  if (type === 'boolean') {
    if (input.length !== 2) {
      issues.push({ path: at, message: 'true/false cards need exactly 2 options', severity: 'error' })
    }
    if (correctCount !== 1) {
      issues.push({ path: at, message: 'true/false cards need exactly 1 correct option', severity: 'error' })
    }
    const labels = input.map((raw) => (isRecord(raw) && typeof raw.text === 'string' ? raw.text : ''))
    if (labels.length === 2 && (labels[0] !== 'True' || labels[1] !== 'False')) {
      issues.push({
        path: at,
        message: 'true/false options must read exactly ["True", "False"], in that order',
        severity: 'error',
      })
    }
  }

  if (type === 'single') {
    if (input.length !== 4) {
      issues.push({
        path: at,
        message: `select-one cards need exactly 4 options (got ${input.length})`,
        severity: 'error',
      })
    }
    if (correctCount !== 1) {
      issues.push({
        path: at,
        message: `select-one cards need exactly 1 correct option (got ${correctCount})`,
        severity: 'error',
      })
    }
  }

  if (type === 'multi') {
    if (input.length < 4) {
      issues.push({
        path: at,
        message: `multiple-choice cards need at least 4 options (got ${input.length})`,
        severity: 'error',
      })
    }
    if (correctCount < 1) {
      issues.push({ path: at, message: 'no correct option marked', severity: 'error' })
    }
    if (correctCount === input.length) {
      issues.push({
        path: at,
        message: 'every option is correct - add at least one distractor',
        severity: 'error',
      })
    }
  }
}

/** Validate `data/catalog.json`. */
export function validateCatalog(input: unknown): ValidationResult<Catalog> {
  const issues: Issue[] = []

  if (!isRecord(input)) {
    issues.push({ path: 'catalog', message: 'expected an object', severity: 'error' })
    return { value: null, issues }
  }

  const domainIds = new Set<string>()
  if (!Array.isArray(input.domains) || input.domains.length === 0) {
    issues.push({ path: 'catalog.domains', message: 'expected a non-empty array', severity: 'error' })
  } else {
    input.domains.forEach((raw, index) => {
      const at = `catalog.domains[${index}]`
      if (!isRecord(raw)) {
        issues.push({ path: at, message: 'expected an object', severity: 'error' })
        return
      }
      for (const key of ['id', 'title', 'tagline', 'description'] as const) {
        if (!isNonEmptyString(raw[key])) {
          issues.push({ path: `${at}.${key}`, message: 'missing or empty', severity: 'error' })
        }
      }
      if (isNonEmptyString(raw.id)) {
        if (domainIds.has(raw.id)) {
          issues.push({ path: `${at}.id`, message: `duplicate domain id "${raw.id}"`, severity: 'error' })
        }
        domainIds.add(raw.id)
      }
      if (typeof raw.status !== 'string' || !DOMAIN_STATUSES.has(raw.status)) {
        issues.push({
          path: `${at}.status`,
          message: `expected one of ${[...DOMAIN_STATUSES].join(', ')}`,
          severity: 'error',
        })
      }
      if (typeof raw.icon !== 'string' || !DOMAIN_ICONS.has(raw.icon)) {
        issues.push({
          path: `${at}.icon`,
          message: `expected one of ${[...DOMAIN_ICONS].join(', ')}`,
          severity: 'error',
        })
      }
      if (typeof raw.order !== 'number' || !Number.isFinite(raw.order)) {
        issues.push({ path: `${at}.order`, message: 'expected a number', severity: 'error' })
      }
    })
  }

  const setKeys = new Set<string>()
  if (!Array.isArray(input.sets)) {
    issues.push({ path: 'catalog.sets', message: 'expected an array', severity: 'error' })
  } else {
    input.sets.forEach((raw, index) => {
      const at = `catalog.sets[${index}]`
      if (!isRecord(raw)) {
        issues.push({ path: at, message: 'expected an object', severity: 'error' })
        return
      }
      for (const key of ['id', 'domainId', 'path', 'title', 'description'] as const) {
        if (!isNonEmptyString(raw[key])) {
          issues.push({ path: `${at}.${key}`, message: 'missing or empty', severity: 'error' })
        }
      }
      if (isNonEmptyString(raw.domainId) && domainIds.size > 0 && !domainIds.has(raw.domainId)) {
        issues.push({
          path: `${at}.domainId`,
          message: `"${raw.domainId}" is not a declared domain`,
          severity: 'error',
        })
      }
      if (isNonEmptyString(raw.domainId) && isNonEmptyString(raw.id)) {
        const key = `${raw.domainId}/${raw.id}`
        if (setKeys.has(key)) {
          issues.push({ path: `${at}.id`, message: `duplicate set "${key}"`, severity: 'error' })
        }
        setKeys.add(key)
        if (raw.path !== key) {
          issues.push({
            path: `${at}.path`,
            message: `expected "${key}" so the data directory matches the route`,
            severity: 'error',
          })
        }
      }
      if (typeof raw.cardCount !== 'number' || !Number.isInteger(raw.cardCount) || raw.cardCount < 0) {
        issues.push({ path: `${at}.cardCount`, message: 'expected a non-negative integer', severity: 'error' })
      }
      if (!Array.isArray(raw.sources) || raw.sources.length === 0) {
        issues.push({
          path: `${at}.sources`,
          message: 'list the note file(s) this set is derived from',
          severity: 'error',
        })
      } else if (raw.sources.some((source) => !isNonEmptyString(source))) {
        issues.push({ path: `${at}.sources`, message: 'expected non-empty strings', severity: 'error' })
      }
    })
  }

  const courseKeys = new Set<string>()
  if (!Array.isArray(input.courses)) {
    issues.push({ path: 'catalog.courses', message: 'expected an array', severity: 'error' })
  } else {
    input.courses.forEach((raw, index) => {
      const at = `catalog.courses[${index}]`
      if (!isRecord(raw)) {
        issues.push({ path: at, message: 'expected an object', severity: 'error' })
        return
      }
      for (const key of ['id', 'domainId', 'path', 'title', 'description'] as const) {
        if (!isNonEmptyString(raw[key])) {
          issues.push({ path: `${at}.${key}`, message: 'missing or empty', severity: 'error' })
        }
      }
      if (isNonEmptyString(raw.domainId) && domainIds.size > 0 && !domainIds.has(raw.domainId)) {
        issues.push({
          path: `${at}.domainId`,
          message: `"${raw.domainId}" is not a declared domain`,
          severity: 'error',
        })
      }
      if (isNonEmptyString(raw.domainId) && isNonEmptyString(raw.id)) {
        const key = `${raw.domainId}/${raw.id}`
        if (courseKeys.has(key)) {
          issues.push({ path: `${at}.id`, message: `duplicate course "${key}"`, severity: 'error' })
        }
        courseKeys.add(key)
        if (raw.path !== key) {
          issues.push({
            path: `${at}.path`,
            message: `expected "${key}" so the study guide file matches the route`,
            severity: 'error',
          })
        }
      }
      if (typeof raw.kind !== 'string' || !COURSE_KINDS.has(raw.kind)) {
        issues.push({
          path: `${at}.kind`,
          message: `expected one of ${[...COURSE_KINDS].join(', ')}`,
          severity: 'error',
        })
      }
      // A course with no sets would render a study guide and a dead quiz button.
      if (!Array.isArray(raw.setIds) || raw.setIds.length === 0) {
        issues.push({
          path: `${at}.setIds`,
          message: 'list the card set id(s) this course quizzes',
          severity: 'error',
        })
      } else if (raw.setIds.some((setId) => !isNonEmptyString(setId))) {
        issues.push({ path: `${at}.setIds`, message: 'expected non-empty strings', severity: 'error' })
      } else if (isNonEmptyString(raw.domainId) && setKeys.size > 0) {
        for (const setId of raw.setIds as string[]) {
          if (!setKeys.has(`${raw.domainId}/${setId}`)) {
            issues.push({
              path: `${at}.setIds`,
              message: `"${setId}" is not a card set in domain "${raw.domainId}"`,
              severity: 'error',
            })
          }
        }
      }
    })
  }

  if (hasErrors(issues)) return { value: null, issues }

  return {
    value: {
      domains: (input.domains as DomainMeta[]).slice().sort((a, b) => a.order - b.order),
      sets: input.sets as CardSetMeta[],
      courses: input.courses as CourseMeta[],
    },
    issues,
  }
}
