import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Children, isValidElement } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import { cn } from '@/utils/cn'
import { Alert } from './ui/Surface'
import type { AlertTone } from './ui/Surface'

/**
 * Renders a note or study guide.
 *
 * Three things the notes actually rely on, none of which come free:
 *
 *  - **GFM tables**, via `remark-gfm`. Several notes carry their whole comparison in one.
 *  - **Inline HTML**, via `rehype-raw`. Markdown has no way to put a list inside a table
 *    cell, so the notes use `<ul><li>` there. The content is committed to this repository
 *    rather than user-supplied, so raw HTML carries no injection risk here.
 *  - **GitHub alerts** (`> [!NOTE]`), which no plugin handles - see `blockquote` below.
 */

const ALERT_TONE: Record<string, AlertTone> = {
  NOTE: 'info',
  TIP: 'success',
  IMPORTANT: 'info',
  WARNING: 'warning',
  CAUTION: 'error',
}

/** The label GitHub renders above each alert type. */
const ALERT_LABEL: Record<string, string> = {
  NOTE: 'Note',
  TIP: 'Tip',
  IMPORTANT: 'Important',
  WARNING: 'Warning',
  CAUTION: 'Caution',
}

/**
 * Pull the leading `[!NOTE]` marker out of a blockquote.
 *
 * GitHub encodes alerts as a blockquote whose first paragraph opens with the marker, so
 * by the time Markdown is parsed the marker is just the first text node. Returning the
 * remaining children lets the alert render its body without the marker showing.
 */
function readAlertMarker(children: ReactNode): { kind: string; body: ReactNode } | null {
  const nodes = Children.toArray(children)
  const first = nodes.find((node) => isValidElement(node))
  if (!isValidElement(first)) return null

  const paragraph = first.props as { children?: ReactNode }
  const parts = Children.toArray(paragraph.children)
  const lead = parts[0]
  if (typeof lead !== 'string') return null

  const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/.exec(lead)
  const kind = match?.[1]
  if (!match || !kind) return null

  // Keep everything after the marker, including the rest of the first paragraph.
  const remainder = lead.slice(match[0].length)
  const restOfParagraph = remainder ? [remainder, ...parts.slice(1)] : parts.slice(1)
  const laterBlocks = nodes.slice(nodes.indexOf(first) + 1)

  return {
    kind,
    body: (
      <>
        {restOfParagraph.length > 0 ? <p>{restOfParagraph}</p> : null}
        {laterBlocks}
      </>
    ),
  }
}

/**
 * Rewrite a link written for GitHub into one that works inside the app.
 *
 * Study guides link notes relatively (`../../notes/aws/saas.md`) so they stay browsable
 * on GitHub. In the app those become `/notes/aws/saas`. Anything already absolute is
 * left alone, and anything external opens in a new tab.
 */
function resolveHref(href: string): { to?: string; external?: boolean } {
  if (/^https?:\/\//i.test(href)) return { external: true }
  if (href.startsWith('#')) return {}

  const noteMatch = /(?:^|\/)notes\/([^/]+)\/([^/]+)\.md$/i.exec(href)
  if (noteMatch) return { to: `/notes/${noteMatch[1]}/${noteMatch[2]}` }

  if (href.startsWith('/')) return { to: href }
  return {}
}

const HEADING = 'font-heading text-content-strong scroll-mt-24'

const components: ComponentPropsWithoutRef<typeof ReactMarkdown>['components'] = {
  h1: ({ children, ...props }) => (
    <h1 className={cn(HEADING, 'mt-0 text-4xl leading-tight')} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className={cn(HEADING, 'mt-10 border-b border-line pb-2 text-3xl')} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className={cn(HEADING, 'mt-8 text-2xl')} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className={cn(HEADING, 'mt-6 text-xl')} {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mt-4 font-body leading-relaxed text-content" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mt-4 list-disc space-y-1.5 pl-6 font-body text-content" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mt-4 list-decimal space-y-1.5 pl-6 font-body text-content" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed [&>ul]:mt-1.5 [&>ol]:mt-1.5" {...props}>
      {children}
    </li>
  ),
  // Wide comparison tables are the norm in these notes, so the table scrolls inside its
  // own container rather than forcing the whole page sideways on a narrow screen.
  table: ({ children, ...props }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left font-body text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-surface-2" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-line px-4 py-2.5 align-top font-heading text-base font-normal text-content-strong"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-line px-4 py-2.5 align-top text-content" {...props}>
      {children}
    </td>
  ),
  a: ({ href, children, ...props }) => {
    const resolved = resolveHref(href ?? '')
    if (resolved.to) {
      return (
        <Link to={resolved.to} className="text-brand underline-offset-2 hover:underline">
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        className="text-brand underline-offset-2 hover:underline"
        {...(resolved.external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  },
  code: ({ children, className, ...props }) => {
    // react-markdown marks fenced blocks with a `language-*` class; bare inline code has none.
    const isBlock = typeof className === 'string' && className.includes('language-')
    if (isBlock) {
      return (
        <code className={cn('font-mono text-sm', className)} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-content-strong"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface-2 p-4 text-content"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }) => {
    const alert = readAlertMarker(children)
    if (alert) {
      return (
        <div className="mt-6">
          <Alert tone={ALERT_TONE[alert.kind]} title={ALERT_LABEL[alert.kind]}>
            {alert.body}
          </Alert>
        </div>
      )
    }
    return (
      <blockquote
        className="mt-4 border-l-4 border-line-strong pl-4 font-body italic text-content-muted"
        {...props}
      >
        {children}
      </blockquote>
    )
  },
  hr: (props) => <hr className="mt-8 border-line" {...props} />,
  strong: ({ children, ...props }) => (
    <strong className="font-medium text-content-strong" {...props}>
      {children}
    </strong>
  ),
}

/**
 * Default-exported so `Markdown.tsx` can pull it in with `React.lazy`. react-markdown and
 * its plugins are the largest dependency in the app, and only note and course pages need
 * them.
 */
export default function MarkdownRenderer({ children }: { children: string }) {
  return (
    // `[&>*:first-child]:mt-0` stops the leading heading's top margin from doubling the
    // container's own padding.
    <div className="[&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
