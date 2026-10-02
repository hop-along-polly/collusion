import type { Citation } from '@/types/cards'

/**
 * GitHub's heading-anchor slug, which `rehype-slug` also generates when the note is
 * rendered in-app, so one slug serves both. Mirrored in `scripts/validate-data.ts`.
 */
export function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * The in-app route for a citation, e.g. `/notes/aws/ai_practitioner#bedrock-agents`.
 *
 * Citations used to point at the repository on GitHub. They point at the note page here
 * instead, which keeps a learner inside the app and does not advertise where the content
 * lives. The anchor resolves because `rehype-slug` puts ids on the rendered headings.
 *
 * A `heading` is a verified Markdown heading and gets an anchor. A `section` is a label
 * that is not a heading, so the link stops at the page rather than pointing at an anchor
 * that does not exist.
 *
 * Returns `null` when the cited file has no page. Only `notes/<domain>/<name>.md` is
 * rendered, so a citation naming an example script has nowhere in-app to go, and the
 * caller shows the label as plain text.
 */
export function citationUrl(citation: Citation): string | null {
  const match = /^notes\/([^/]+)\/(.+)\.md$/i.exec(citation.file)
  if (!match) return null

  const base = `/notes/${match[1]}/${match[2]}`

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

/** "3 days ago" - used for the last-session stamp on set cards. */
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
