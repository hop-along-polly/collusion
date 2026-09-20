import type { Citation } from '@/types/cards'
import { citationLabel, citationUrl } from '@/utils/format'
import { Icon } from '../ui/Icon'

/**
 * Where the answer came from. Every card carries at least one citation, and
 * `npm run validate:data` proves each one resolves to a real file and heading, so these
 * links cannot rot silently as the notes are edited.
 */
export function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <div className="mt-6 border-t border-line pt-4">
      <h3 className="font-body text-xs uppercase tracking-widest text-content-muted">
        {citations.length === 1 ? 'Source' : 'Sources'}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {citations.map((citation) => (
          <li key={citationLabel(citation)}>
            <a
              href={citationUrl(citation)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 py-1 font-mono text-sm text-brand underline-offset-2 hover:underline"
            >
              <Icon name="external" size={14} className="shrink-0" />
              <span className="break-all">{citationLabel(citation)}</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
