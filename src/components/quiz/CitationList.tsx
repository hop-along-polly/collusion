import { Link } from 'react-router-dom'

import type { Citation } from '@/types/cards'
import { citationLabel, citationUrl } from '@/utils/format'
import { Icon } from '../ui/Icon'

/**
 * Where the answer came from. Every card carries at least one citation, and
 * `npm run validate:data` proves each one resolves to a real file and heading, so these
 * links cannot rot silently as the notes are edited.
 *
 * These go to the note's own page rather than out to the repository, so following a source
 * keeps the learner in the app. A citation whose file has no page, which today means the
 * example scripts, renders as a label with no link rather than a dead one.
 */
export function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-6 border-t border-line pt-4">
      <h3 className="font-body text-xs uppercase tracking-widest text-content-muted">
        {citations.length === 1 ? 'Source' : 'Sources'}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {citations.map((citation) => {
          const label = citationLabel(citation)
          const to = citationUrl(citation)

          return (
            <li key={label}>
              {to ? (
                <Link
                  to={to}
                  className="inline-flex min-h-[44px] items-center gap-1.5 py-1 font-mono text-sm text-brand underline-offset-2 hover:underline"
                >
                  <Icon name="book" size={14} className="shrink-0" />
                  <span className="break-all">{label}</span>
                </Link>
              ) : (
                <span className="inline-flex min-h-[44px] items-center gap-1.5 py-1 font-mono text-sm text-content-muted">
                  <Icon name="book" size={14} className="shrink-0" />
                  <span className="break-all">{label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
