/**
 * Content types. Everything the learner reads is described here and lives in
 * version-controlled JSON under `/data` — the UI never hard-codes a question.
 */

/**
 * `single`  — exactly one correct option (4 options by convention).
 * `multi`   — "select all that apply"; one or more correct options.
 * `boolean` — True/False; exactly two options.
 */
export type CardType = 'single' | 'multi' | 'boolean'

/**
 * A pointer back into the repository's Markdown notes.
 *
 * `heading` and `section` are mutually exclusive and encode whether a deep link is
 * possible. A `heading` is a real Markdown `#` heading, so GitHub generates an anchor
 * and the citation links straight to it. A `section` is a labelled region that is not
 * a heading — Ansible.md numbers its sections as list items, and github_cd-cd.md marks
 * some with bold text — so the citation names the region but links to the file itself
 * rather than to an anchor that does not exist. `npm run validate:data` enforces the
 * distinction against the actual note files.
 */
export interface Citation {
  /** Repo-relative path, e.g. `Anthropic Academy/building_with_claude_api.md`. */
  file: string
  /** A real Markdown heading inside that file, e.g. `Handling ToolUseBlock`. */
  heading?: string
  /** A labelled region that is not a Markdown heading, e.g. Ansible's `Inventory`. */
  section?: string
  /** Overrides the anchor derived from `heading`. Rarely needed. */
  anchor?: string
}

export interface CardOption {
  /** Stable within its card. Answers are persisted by this id, so never renumber. */
  id: string
  text: string
  correct: boolean
  /**
   * Why this option is right or wrong. Shown in the post-submit breakdown, which
   * is where "why common wrong answers are wrong" gets answered per-option.
   */
  rationale?: string
}

interface CardBase {
  /** Unique within its card set. Persisted in progress, so never renumber. */
  id: string
  /** The question stem. Supports a small inline subset: `code`, **bold**. */
  prompt: string
  /** Prose shown after submit: why the key is the key. */
  explanation: string
  /** At least one citation — every card must be traceable to the notes. */
  citations: Citation[]
  /** Free-form topic tags, used for grouping and future filtering. */
  tags?: string[]
}

export interface SingleCard extends CardBase {
  type: 'single'
  options: CardOption[]
}

export interface MultiCard extends CardBase {
  type: 'multi'
  options: CardOption[]
}

export interface BooleanCard extends CardBase {
  type: 'boolean'
  /** Exactly two options, True first by convention. */
  options: [CardOption, CardOption]
}

export type Card = SingleCard | MultiCard | BooleanCard

/** Catalog-level description of a card set — enough to render a list without loading cards. */
export interface CardSetMeta {
  /** Unique within its domain, e.g. `claude-api`. */
  id: string
  domainId: string
  /** Directory under `/data`, e.g. `anthropic/claude-api`. */
  path: string
  title: string
  /** Short qualifier shown under the title, e.g. "Anthropic Academy". */
  subtitle?: string
  description: string
  /** Note files this set is derived from; rendered as links on the set page. */
  sources: string[]
  /** Kept in sync with the card file by `npm run validate:data`. */
  cardCount: number
}

/** A fully loaded set: metadata plus its cards. */
export interface CardSet extends CardSetMeta {
  cards: Card[]
}

/** A top-level subject area, e.g. AWS or Anthropic. */
export interface DomainMeta {
  id: string
  title: string
  /** One-line hook for the landing page card. */
  tagline: string
  /** Longer copy for the domain page header. */
  description: string
  /**
   * `planned` domains render with an honest empty state instead of being hidden,
   * so the roadmap is visible and there are no dead links.
   */
  status: 'available' | 'planned'
  icon: DomainIcon
  order: number
}

export type DomainIcon = 'sparkles' | 'cloud' | 'workflow' | 'terminal'

export interface Catalog {
  domains: DomainMeta[]
  sets: CardSetMeta[]
}
