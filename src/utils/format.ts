import type { Citation } from '@/types/cards'

/** The repository these notes live in — citations link back to it. */
const REPO_BLOB_URL = 'https://github.com/hop-along-polly/collusion/blob/master'

/** GitHub's heading-anchor slug. Mirrored in `scripts/validate-data.ts`. */
export function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Builds the GitHub URL for a citation. A `heading` is a verified Markdown heading and
 * gets an anchor; a `section` is a label that is not a heading, so the link stops at
 * the file rather than pointing at an anchor that does not exist.
 */
export function citationUrl(citation: Citation): string {
  const path = citation.file.split('/').map(encodeURIComponent).join('/')
  const base = `${REPO_BLOB_URL}/${path}`

  if (citation.anchor) return `${base}#${citation.anchor}`
  if (citation.heading) return `${base}#${slugify(citation.heading)}`
  return base
}

/** Human label for a citation: `file › heading`. */
export function citationLabel(citation: Citation): string {
  const location = citation.heading ?? citation.section
  return location ? `${citation.file} › ${location}` : citation.file
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

/** "3 days ago" — used for the last-session stamp on set cards. */
export function relativeTime(timestamp: number, now = Date.now()): string {
  const elapsed = timestamp - now
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= ms) return formatter.format(Math.round(elapsed / ms), unit)
  }
  return formatter.format(0, 'minute')
}

/** Card-type label shown as a badge on every question. */
export function cardTypeLabel(type: 'single' | 'multi' | 'boolean'): string {
  switch (type) {
    case 'single':
      return 'Select one'
    case 'multi':
      return 'Select all that apply'
    case 'boolean':
      return 'True or false'
  }
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
