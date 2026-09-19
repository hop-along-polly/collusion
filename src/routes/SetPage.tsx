import { Link, useParams } from 'react-router-dom'

import { findDomain, findSet } from '@/data/catalog'
import { useCardSet } from '@/hooks/useCardSet'
import { useProgress } from '@/hooks/useProgress'
import { citationUrl, pluralize, relativeTime } from '@/utils/format'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, Loading, ProgressBar, Stat } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Alert, Badge, Card } from '@/components/ui/Surface'
import { NotFoundPage } from './NotFoundPage'

export function SetPage() {
  const { domainId, setId } = useParams<{ domainId: string; setId: string }>()
  const domain = domainId ? findDomain(domainId) : undefined
  const meta = domainId && setId ? findSet(domainId, setId) : undefined

  const state = useCardSet(meta)
  const { summarize, resetSet } = useProgress()

  if (!domain || !meta) return <NotFoundPage />

  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="font-body text-sm text-content-muted">
      <Link to="/" className="hover:text-brand">
        Home
      </Link>
      <Icon name="chevron-right" size={14} className="mx-1 inline align-[-2px]" />
      <Link to={`/${domain.id}`} className="hover:text-brand">
        {domain.title}
      </Link>
      <Icon name="chevron-right" size={14} className="mx-1 inline align-[-2px]" />
      <span aria-current="page" className="text-content">
        {meta.title}
      </span>
    </nav>
  )

  const header = (
    <header className="max-w-3xl">
      {breadcrumb}
      <h1 className="mt-3 font-heading text-5xl leading-none">{meta.title}</h1>
      {meta.subtitle ? (
        <p className="mt-1 font-body text-sm uppercase tracking-widest text-brand">{meta.subtitle}</p>
      ) : null}
      <p className="mt-4 font-body text-lg text-content-muted">{meta.description}</p>
    </header>
  )

  if (state.status === 'loading') {
    return (
      <div className="space-y-8">
        {header}
        <Loading label={`Loading ${meta.title}…`} />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-8">
        {header}
        <EmptyState
          icon="alert"
          title="This card set could not be loaded"
          description={
            <>
              <span className="block">{state.error.message}</span>
              <span className="mt-2 block">
                Run <code className="font-mono text-content">npm run validate:data</code> to see
                exactly which card is malformed.
              </span>
            </>
          }
          action={
            <ButtonLink to={`/${domain.id}`} variant="outline">
              <Icon name="arrow-left" size={16} />
              Back to {domain.title}
            </ButtonLink>
          }
        />
      </div>
    )
  }

  const cards = state.data.cards
  const cardIds = cards.map((card) => card.id)
  const summary = summarize(meta.path, cardIds)
  const unseen = cards.length - summary.attempted

  return (
    <div className="space-y-8">
      {header}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-8">
            <Stat label="Cards" value={cards.length} tone="brand" />
            <Stat label="Seen" value={summary.attempted} />
            <Stat
              label="Accuracy"
              value={summary.attempted === 0 ? '—' : `${summary.accuracy}%`}
              tone={summary.attempted === 0 ? 'default' : summary.accuracy >= 70 ? 'success' : 'error'}
            />
            <Stat label="In review" value={summary.reviewable} tone={summary.reviewable > 0 ? 'error' : 'default'} />
          </div>

          <ProgressBar
            value={summary.attempted}
            max={cards.length}
            label={`${summary.attempted} of ${cards.length} cards seen`}
          />

          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink to={`/${domain.id}/${meta.id}/quiz?mode=practice`} size="lg">
              {summary.attempted === 0 ? 'Start practice' : 'Practice all cards'}
              <Icon name="arrow-right" size={18} />
            </ButtonLink>

            {summary.reviewable > 0 ? (
              <ButtonLink to={`/${domain.id}/${meta.id}/quiz?mode=review`} variant="outline" size="lg">
                <Icon name="target" size={18} />
                Review {pluralize(summary.reviewable, 'card')}
              </ButtonLink>
            ) : null}
          </div>

          {summary.reviewable === 0 && summary.attempted > 0 ? (
            <Alert tone="success" title="Nothing waiting in review">
              Every card you have answered was correct on its most recent attempt, and none are
              starred. Missed or starred cards collect here automatically.
            </Alert>
          ) : null}

          {unseen > 0 && summary.attempted > 0 ? (
            <p className="font-body text-sm text-content-muted">
              {pluralize(unseen, 'card')} still unseen in this set.
            </p>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card tone="parchment">
            <h2 className="font-heading text-2xl">Derived from</h2>
            <ul className="mt-3 space-y-2">
              {meta.sources.map((source) => (
                <li key={source}>
                  <a
                    href={citationUrl({ file: source })}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-1.5 font-mono text-sm text-brand underline-offset-2 hover:underline"
                  >
                    <Icon name="external" size={14} className="mt-1 shrink-0" />
                    <span className="break-all">{source}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-body text-sm text-accent-foreground">
              Each card cites the specific heading it came from, checked against the note files at
              build time.
            </p>
          </Card>

          <Card>
            <h2 className="font-heading text-2xl">Your progress</h2>
            <dl className="mt-3 space-y-2 font-body text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Correct last time</dt>
                <dd className="text-content-strong">{summary.correct}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Missed last time</dt>
                <dd className="text-content-strong">{summary.missed}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Marked for review</dt>
                <dd className="text-content-strong">{summary.marked}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-content-muted">Last session</dt>
                <dd className="text-content-strong">
                  {summary.lastSessionAt ? relativeTime(summary.lastSessionAt) : 'Never'}
                </dd>
              </div>
            </dl>

            {summary.attempted > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 -ml-3 text-bad-text hover:bg-bad-fill"
                onClick={() => {
                  if (window.confirm(`Reset your progress for "${meta.title}"? This cannot be undone.`)) {
                    resetSet(meta.path)
                  }
                }}
              >
                <Icon name="rotate" size={16} />
                Reset this set
              </Button>
            ) : (
              <p className="mt-4 font-body text-sm text-content-subtle">
                Nothing recorded yet. Progress is kept in this browser only.
              </p>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            {[...new Set(cards.flatMap((card) => card.tags ?? []))].sort().map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
