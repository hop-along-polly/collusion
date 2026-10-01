import { Suspense, lazy } from 'react'

const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'))

/**
 * Markdown rendering, code-split.
 *
 * react-markdown plus `remark-gfm` and `rehype-raw` is the single largest dependency in
 * the app. Only the note and course pages render prose, so the parser is fetched when one
 * of those pages mounts rather than on first load.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <Suspense fallback={<p className="font-body text-content-muted">Rendering…</p>}>
      <MarkdownRenderer>{children}</MarkdownRenderer>
    </Suspense>
  )
}
