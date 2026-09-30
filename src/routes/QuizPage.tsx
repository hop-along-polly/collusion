import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { QuizRunner } from '@/components/quiz/QuizRunner'
import { Loading } from '@/components/ui/Feedback'
import { findDomain, findSet } from '@/data/catalog'
import { useCardSet } from '@/hooks/useCardSet'
import { buildSetDeck } from '@/quiz/deck'
import type { QuizMode } from '@/types/quiz'
import { NotFoundPage } from './NotFoundPage'

function parseMode(value: string | null): QuizMode {
  return value === 'review' ? 'review' : 'practice'
}

/**
 * A session over one card set. The flow itself lives in `QuizRunner`, which a course
 * session shares; this page only resolves the set and wraps it in a deck.
 */
export function QuizPage() {
  const { domainId, setId } = useParams<{ domainId: string; setId: string }>()
  const [searchParams] = useSearchParams()
  const mode = parseMode(searchParams.get('mode'))
  const [attempt, setAttempt] = useState(0)

  const meta = domainId && setId ? findSet(domainId, setId) : undefined
  const domain = domainId ? findDomain(domainId) : undefined
  const state = useCardSet(meta)

  const deck = useMemo(
    () => (meta && domain && state.status === 'ready' ? buildSetDeck(domain.id, meta, state.data) : undefined),
    [meta, domain, state],
  )

  if (!meta || !domain) return <NotFoundPage />
  if (state.status === 'loading') return <Loading label={`Loading ${meta.title}`} />
  if (state.status === 'error' || !deck) {
    return <NotFoundPage />
  }

  return (
    <QuizRunner
      key={`${deck.id}:${mode}:${attempt}`}
      deck={deck}
      mode={mode}
      onRestart={() => setAttempt((value) => value + 1)}
      footer={
        <p className="font-body text-sm text-content-subtle">
          Looking for something else?{' '}
          <Link to={`/${domain.id}`} className="text-brand underline-offset-2 hover:underline">
            Other {domain.title} sets
          </Link>{' '}
          ·{' '}
          <Link to="/" className="text-brand underline-offset-2 hover:underline">
            All domains
          </Link>
        </p>
      }
    />
  )
}
