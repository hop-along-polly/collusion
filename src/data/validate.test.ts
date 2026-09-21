import { describe, expect, it } from 'vitest'

import { hasErrors, validateCards, validateCatalog } from './validate'

function baseCard(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    type: 'single',
    prompt: 'Which one?',
    explanation: 'Because.',
    citations: [{ file: 'notes.md', heading: 'A heading' }],
    options: [
      { id: 'a', text: 'A', correct: true },
      { id: 'b', text: 'B', correct: false },
      { id: 'c', text: 'C', correct: false },
      { id: 'd', text: 'D', correct: false },
    ],
    ...overrides,
  }
}

function messages(input: unknown): string[] {
  return validateCards(input).issues.map((issue) => `${issue.path}: ${issue.message}`)
}

describe('validateCards', () => {
  it('accepts a well-formed card', () => {
    const result = validateCards([baseCard()])

    expect(hasErrors(result.issues)).toBe(false)
    expect(result.value).toHaveLength(1)
  })

  it('rejects a select-one card that does not have exactly four options', () => {
    const card = baseCard({ options: baseCard().options.slice(0, 3) })
    expect(messages([card]).join('\n')).toContain('exactly 4 options')
  })

  it('rejects a select-one card with more than one correct option', () => {
    const options = baseCard().options.map((option) => ({ ...option, correct: true }))
    expect(messages([baseCard({ options })]).join('\n')).toContain('exactly 1 correct option')
  })

  it('rejects a multi card where every option is correct', () => {
    const options = baseCard().options.map((option) => ({ ...option, correct: true }))
    expect(messages([baseCard({ type: 'multi', options })]).join('\n')).toContain('add at least one distractor')
  })

  it('requires true/false options to read exactly True then False', () => {
    const card = baseCard({
      type: 'boolean',
      options: [
        { id: 'a', text: 'False', correct: true },
        { id: 'b', text: 'True', correct: false },
      ],
    })
    expect(messages([card]).join('\n')).toContain('in that order')
  })

  it('requires at least one citation', () => {
    expect(messages([baseCard({ citations: [] })]).join('\n')).toContain('at least one citation')
  })

  it('rejects a citation that claims to be both a heading and a section', () => {
    const card = baseCard({ citations: [{ file: 'notes.md', heading: 'X', section: 'X' }] })
    expect(messages([card]).join('\n')).toContain('not both')
  })

  it('rejects duplicate card ids, which would collide in stored progress', () => {
    expect(messages([baseCard(), baseCard()]).join('\n')).toContain('duplicate card id')
  })

  it('rejects duplicate option ids within a card', () => {
    const options = baseCard().options.map((option) => ({ ...option, id: 'a' }))
    expect(messages([baseCard({ options })]).join('\n')).toContain('duplicate option id')
  })

  it('warns but does not fail on "all of the above"', () => {
    const options = baseCard().options.map((option, index) =>
      index === 3 ? { ...option, text: 'All of the above' } : option,
    )
    const result = validateCards([baseCard({ options })])

    expect(hasErrors(result.issues)).toBe(false)
    expect(result.issues.some((issue) => issue.severity === 'warning')).toBe(true)
  })

  it('rejects an empty set', () => {
    expect(messages([]).join('\n')).toContain('card set is empty')
  })
})

describe('meta-reference rule', () => {
  // A card must read as a standalone statement about its subject. Talking about the
  // source note makes it a document-recall question, and it invites overreach: one
  // rejected card presented Python's `globals()` as *the* way to dispatch a tool call.
  const CASES: [string, Record<string, unknown>][] = [
    ['prompt', { prompt: 'Which practices does the API Best Practices section recommend?' }],
    ['explanation', { explanation: 'The notes state the opposite.' }],
    ['prompt naming the notes', { prompt: 'What do the notes say about streaming?' }],
    ['possessive', { explanation: "The notes' own example uses `*.go`." }],
    ['attribution', { explanation: 'Python is named according to the note.' }],
    ['this document', { explanation: 'This document opens with a warning.' }],
    ['this section', { explanation: 'That is what this section tests.' }],
  ]

  for (const [label, overrides] of CASES) {
    it(`rejects a ${label} that refers to the source note`, () => {
      const result = validateCards([baseCard(overrides)])
      expect(hasErrors(result.issues)).toBe(true)
    })
  }

  it('rejects a meta-reference hiding in an option rationale', () => {
    const options = baseCard().options.map((option, index) =>
      index === 0 ? { ...option, rationale: 'The notes look it up in `globals()`.' } : option,
    )
    expect(hasErrors(validateCards([baseCard({ options })]).issues)).toBe(true)
  })

  it('allows subject vocabulary that merely looks similar', () => {
    const card = baseCard({
      // "document" as the thing being chunked, "sectioning" as a pattern name,
      // "document" as a verb, and "release notes" as a real feature.
      prompt: 'Which chunking strategy splits a document by structure?',
      explanation:
        'Parallelization (sectioning) divides independent subtasks. Thoroughly document your tools. ' +
        'A Seller can update a version release notes after publishing.',
    })
    expect(hasErrors(validateCards([card]).issues)).toBe(false)
  })
})

describe('validateCatalog', () => {
  const domain = {
    id: 'anthropic',
    title: 'Anthropic',
    tagline: 'x',
    description: 'y',
    status: 'available',
    icon: 'sparkles',
    order: 1,
  }
  const set = {
    id: 'claude-api',
    domainId: 'anthropic',
    path: 'anthropic/claude-api',
    title: 'Claude API',
    description: 'z',
    sources: ['notes.md'],
    cardCount: 3,
  }

  it('accepts a consistent catalog and sorts domains by order', () => {
    const result = validateCatalog({
      domains: [{ ...domain, id: 'devops', order: 2 }, domain],
      sets: [set],
    })

    expect(hasErrors(result.issues)).toBe(false)
    expect(result.value?.domains.map((d) => d.id)).toEqual(['anthropic', 'devops'])
  })

  it('rejects a set whose path does not match domain/id', () => {
    const result = validateCatalog({ domains: [domain], sets: [{ ...set, path: 'elsewhere' }] })
    expect(result.issues.map((i) => i.message).join('\n')).toContain('so the data directory matches the route')
  })

  it('rejects a set pointing at an undeclared domain', () => {
    const result = validateCatalog({ domains: [domain], sets: [{ ...set, domainId: 'aws', path: 'aws/claude-api' }] })
    expect(result.issues.map((i) => i.message).join('\n')).toContain('not a declared domain')
  })

  it('requires each set to name its source notes', () => {
    const result = validateCatalog({ domains: [domain], sets: [{ ...set, sources: [] }] })
    expect(result.issues.map((i) => i.message).join('\n')).toContain('list the note file')
  })
})
