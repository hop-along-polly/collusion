import { Link } from 'react-router-dom'

import { catalog, listSets, totalCardCount } from '@/data/catalog'
import { useProgress } from '@/hooks/useProgress'
import { overallSummary } from '@/storage/progress'
import type { DomainMeta } from '@/types/cards'
import { pluralize } from '@/utils/format'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { Stat } from '@/components/ui/Feedback'
import { ButtonLink } from '@/components/ui/Button'

function DomainCard({ domain }: { domain: DomainMeta }) {
  const sets = listSets(domain.id)
  const cards = sets.reduce((total, set) => total + set.cardCount, 0)
  const planned = domain.status === 'planned'

  return (
    <Card
      tone={planned ? 'parchment' : 'surface'}
      interactive={!planned}
      className="flex h-full flex-col"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-fill text-brand">
          <Icon name={domain.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-3xl leading-none">{domain.title}</h3>
          <p className="mt-2 font-body text-content-muted">{domain.tagline}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {planned ? (
          <Badge tone="warning">Notes pending</Badge>
        ) : (
          <>
            <Badge tone="brand">{pluralize(sets.length, 'set')}</Badge>
            <Badge>{pluralize(cards, 'card')}</Badge>
          </>
        )}
      </div>

      <div className="mt-6 flex-1" />

      {planned ? (
        <p className="font-body text-sm text-content-muted">
          Cards stay grounded in committed notes, and this repository has none for {domain.title} yet.
        </p>
      ) : (
        <ButtonLink to={`/${domain.id}`} variant="outline" className="self-start">
          Browse {domain.title}
          <Icon name="arrow-right" size={16} />
        </ButtonLink>
      )}
    </Card>
  )
}

export function HomePage() {
  const { snapshot } = useProgress()
  const overall = overallSummary(snapshot)
  const available = catalog.domains.filter((domain) => domain.status === 'available')

  return (
    <div className="space-y-12">
      <section className="max-w-3xl">
        <p className="font-body text-xs uppercase tracking-widest text-brand">
          Software by master craftsmen
        </p>
        <h1 className="mt-3 font-heading text-5xl leading-none sm:text-6xl">
          Study what you actually wrote down.
        </h1>
        <p className="mt-5 font-body text-lg text-content-muted">
          Every question here is generated from the Markdown notes committed to this repository, and
          every explanation links back to the file and heading it came from. No invented facts, no
          trivia that is not in your notes.
        </p>

        <div className="mt-8 flex flex-wrap gap-8">
          <Stat label="Cards" value={totalCardCount()} tone="brand" />
          <Stat label="Card sets" value={catalog.sets.length} />
          <Stat label="Domains" value={available.length} />
          {overall.attempted > 0 ? (
            <>
              <Stat label="Answered" value={overall.attempted} />
              <Stat
                label="Accuracy"
                value={`${overall.accuracy}%`}
                tone={overall.accuracy >= 70 ? 'success' : 'error'}
              />
            </>
          ) : null}
        </div>

        {overall.reviewable > 0 ? (
          <p className="mt-6 font-body text-sm text-content-muted">
            You have {pluralize(overall.reviewable, 'card')} waiting in review across{' '}
            {pluralize(overall.setsStarted, 'set')}.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="domains-heading">
        <h2 id="domains-heading" className="font-heading text-4xl">
          Domains
        </h2>
        <p className="mt-2 font-body text-content-muted">
          Pick a subject area, then a certification or topic set.
        </p>

        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.domains.map((domain) => (
            <li key={domain.id}>
              <DomainCard domain={domain} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="max-w-3xl">
        <h2 id="how-heading" className="font-heading text-4xl">
          How a session works
        </h2>
        <ol className="mt-4 space-y-3 font-body text-content-muted">
          <li className="flex gap-3">
            <span className="font-heading text-2xl leading-none text-brand">1</span>
            <span>
              Answer a question — select one, select all that apply, or true/false. Nothing is graded
              until you submit.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-heading text-2xl leading-none text-brand">2</span>
            <span>
              Submit to see the verdict, an explanation of why each option is right or wrong, and a
              link to the note it came from.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-heading text-2xl leading-none text-brand">3</span>
            <span>
              Anything you miss or star lands in <strong className="text-content">review mode</strong>,
              so a second pass only covers what you have not nailed yet.
            </span>
          </li>
        </ol>
        <p className="mt-4 font-body text-sm text-content-subtle">
          Progress is stored in this browser only — there is no account and nothing leaves your
          machine.{' '}
          <Link to="/anthropic" className="text-brand underline-offset-2 hover:underline">
            Start with Anthropic
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
