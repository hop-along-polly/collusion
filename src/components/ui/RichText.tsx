import { Fragment } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

/**
 * A deliberately tiny Markdown subset for card copy: fenced code blocks, inline
 * `code`, **bold** and *italic*. Everything is built as React elements — no
 * `dangerouslySetInnerHTML` — so card JSON can never inject markup into the page.
 * Anything richer than this belongs in the notes, not on a flashcard.
 */

const FENCE = /```(\w*)\n([\s\S]*?)```/g
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((token, index) => {
    const key = `${keyPrefix}-${index}`

    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return <code key={key}>{token.slice(1, -1)}</code>
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }
    return <Fragment key={key}>{token}</Fragment>
  })
}

interface RichTextProps {
  children: string
  className?: string
  /** Render as a single line (no paragraph spacing) — used inside option labels. */
  inline?: boolean
}

export function RichText({ children, className, inline = false }: RichTextProps) {
  if (inline) {
    return <span className={cn('prose-note', className)}>{renderInline(children, 'i')}</span>
  }

  const blocks: ReactNode[] = []
  let cursor = 0
  let blockIndex = 0

  const pushProse = (text: string) => {
    for (const paragraph of text.split(/\n{2,}/)) {
      const trimmed = paragraph.trim()
      if (!trimmed) continue
      blocks.push(
        <p key={`p-${blockIndex++}`} className="font-body text-content">
          {renderInline(trimmed, `p${blockIndex}`)}
        </p>,
      )
    }
  }

  FENCE.lastIndex = 0
  let match = FENCE.exec(children)
  while (match !== null) {
    pushProse(children.slice(cursor, match.index))
    blocks.push(
      <pre
        key={`code-${blockIndex++}`}
        // §9: code blocks are already dark-on-dark and need no dark-mode variant.
        className="overflow-x-auto rounded-lg bg-[#18181B] p-4 font-mono text-sm text-[#F4F4F5]"
      >
        <code>{(match[2] ?? '').replace(/\n$/, '')}</code>
      </pre>,
    )
    cursor = match.index + match[0].length
    match = FENCE.exec(children)
  }
  pushProse(children.slice(cursor))

  return <div className={cn('prose-note space-y-3', className)}>{blocks}</div>
}
