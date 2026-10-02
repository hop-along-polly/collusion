// Relative, not `@/types/cards`: `scripts/write-sitemap.ts` imports this module and the
// node tsconfig has no path alias. `src/data/validate.ts` is shared the same way.
import type { Catalog } from '../types/cards'

/**
 * The URL set a crawler should see, derived from the catalog so it cannot drift from the
 * content. A sitemap listing a page that no longer exists is worse than no sitemap, since
 * it teaches a crawler to distrust the file.
 *
 * Kept as a pure function so the decisions below are testable without a build.
 */

/** Notes identified the way the router identifies them: domain plus basename. */
export interface SitemapNote {
  domainId: string
  id: string
}

/**
 * Every indexable path, in the order a reader would meet them.
 *
 * Three deliberate exclusions:
 *
 *  - **Quiz routes.** A session is interactive state, not a document. Indexing
 *    `/courses/aws/clf-c02/quiz` would land a searcher mid-question with no context.
 *  - **Planned domains.** A domain with `status: "planned"` renders an empty state, so
 *    listing it invites a crawler to index a page that says there is nothing here.
 *  - **The 404 route.** Nothing links to it and it has no content of its own.
 */
export function sitemapPaths(catalog: Catalog, notes: SitemapNote[]): string[] {
  const paths = ['/', '/courses', '/notes']

  for (const domain of catalog.domains) {
    if (domain.status !== 'available') continue
    paths.push(`/${domain.id}`)
  }

  for (const course of catalog.courses) {
    paths.push(`/courses/${course.path}`)
  }

  for (const note of notes) {
    paths.push(`/notes/${note.domainId}/${note.id}`)
  }

  return paths
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char)
}

/**
 * Renders a sitemap. `origin` has no trailing slash, `base` is the deployment's base path
 * (`/` at a domain root), so a fork published under a project path still produces URLs
 * that resolve.
 *
 * No `lastmod`. A build-time timestamp on every URL says only that a build happened,
 * which is noise a crawler learns to ignore, and per-file git dates would make the
 * sitemap depend on checkout depth.
 */
export function renderSitemap(origin: string, base: string, paths: string[]): string {
  const prefix = base.replace(/\/$/, '')
  const urls = paths
    .map((path) => `${origin}${prefix}${path === '/' ? '/' : path}`)
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
