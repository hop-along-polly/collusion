import { Link, useParams } from 'react-router-dom'

import { findDomain, listSets } from '@/data/catalog'
import { useProgress } from '@/hooks/useProgress'
import { getSetProgress } from '@/storage/progress'
import type { CardSetMeta } from '@/types/cards'
import { pluralize, relativeTime } from '@/utils/format'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, ProgressBar } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { NotFoundPage } from './NotFoundPage'

function SetCard({ set }: { set: CardSetMeta }) {
  const { snapshot } = useProgress()
  // Counting attempted cards straight from the snapshot avoids loading the card file
  // just to render a list row — set pages load their cards, index pages do not.
  const progress = getSetProgress(snapshot, set.path)
  const attempted = Object.values(progress.cards).filter((card) => card.attempts > 0).length
  const started = attempted > 0

  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-heading text-3xl leading-none">
          <Link to={`/${set.domainId}/${set.id}`} className="hover:text-brand">
            {/* Stretch the link across the card so the whole surface is clickable. */}
            <span className="absolute inset-0 rounded-lg" aria-hidden="true" />
            {set.title}
          </Link>
        </h2>
        {set.subtitle ? (
          <span className="font-body text-sm text-content-subtle">{set.subtitle}</span>
        ) : null}
      </div>

      <p className="mt-3 font-body text-content-muted">{set.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="brand">{pluralize(set.cardCount, 'card')}</Badge>
        {started ? (
          <Badge tone={attempted >= set.cardCount ? 'success' : 'neutral'}>
            {attempted} / {set.cardCount} seen
          </Badge>
        ) : (
          <Badge>Not started</Badge>
        )}
      </div>

      <div className="mt-auto pt-5">
        {started ? (
          <>
            <ProgressBar
              value={attempted}
              max={set.cardCount}
              label={`${set.title}: ${attempted} of ${set.cardCount} cards seen`}
            />
            {progress.lastSessionAt ? (
              <p className="mt-2 font-body text-xs text-content-subtle">
                Last studied {relativeTime(progress.lastSessionAt)}
              </p>
            ) : null}
          </>
        ) : (
          <p className="font-body text-sm text-content-subtle">
            From {set.sources.map((source) => source.split('/').pop()).join(', ')}
          </p>
        )}
      </div>
    </Card>
  )
}

export function DomainPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const domain = domainId ? findDomain(domainId) : undefined

  if (!domain) return <NotFoundPage />

  const sets = listSets(domain.id)

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="font-body text-sm text-content-muted">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
          <Icon name="chevron-right" size={14} className="mx-1 inline align-[-2px]" />
          <span aria-current="page" className="text-content">
            {domain.title}
          </span>
        </nav>

        <h1 className="mt-3 font-heading text-5xl leading-none">{domain.title}</h1>
        <p className="mt-4 font-body text-lg text-content-muted">{domain.description}</p>
      </header>

      {sets.length === 0 ? (
        <EmptyState
          icon={domain.icon}
          title={`No ${domain.title} card sets yet`}
          description={
            <>
              Cards must be grounded in the Markdown notes committed to this repository, and there are
              no {domain.title} notes here yet. Add a note file, drop a{' '}
              <code className="font-mono text-content">cards.json</code> beside it under{' '}
              <code className="font-mono text-content">data/{domain.id}/</code>, and register it in{' '}
              <code className="font-mono text-content">data/catalog.json</code> — no application code
              changes required.
            </>
          }
          action={
            <>
              <ButtonLink to="/" variant="outline">
                <Icon name="arrow-left" size={16} />
                Back to domains
              </ButtonLink>
              <ButtonLink to="/anthropic">Study something else</ButtonLink>
            </>
          }
        />
      ) : (
        <ul className="grid gap-6 lg:grid-cols-2">
          {sets.map((set) => (
            <li key={set.id} className="relative">
              <SetCard set={set} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
