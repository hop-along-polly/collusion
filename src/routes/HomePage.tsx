import { Link } from 'react-router-dom'

import { catalog, courseSets, listCourses, totalCardCount } from '@/data/catalog'
import { useProgress } from '@/hooks/useProgress'
import { overallSummary } from '@/storage/progress'
import type { DomainMeta } from '@/types/cards'
import { pluralize } from '@/utils/format'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { Stat } from '@/components/ui/Feedback'
import { ButtonLink } from '@/components/ui/Button'

function DomainCard({ domain }: { domain: DomainMeta }) {
  const courses = listCourses(domain.id)
  const cards = courses.reduce(
    (total, course) => total + courseSets(course).reduce((sum, set) => sum + set.cardCount, 0),
    0,
  )
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
            <Badge tone="brand">{pluralize(courses.length, 'course')}</Badge>
            <Badge>{pluralize(cards, 'card')}</Badge>
          </>
        )}
      </div>

      <div className="mt-6 flex-1" />

      {planned ? (
        <p className="font-body text-sm text-content-muted">
          {domain.title} course material is still being written.
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
          Know the material before exam day.
        </h1>
        <p className="mt-5 font-body text-lg text-content-muted">
          Course material hand-written by practitioners who have sat these exams and passed them,
          pitched at the fundamentals rather than the question bank — so what you learn holds up
          long after the exam.
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
            {pluralize(overall.coursesStarted, 'course')}.
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

      <section aria-labelledby="why-heading" className="max-w-3xl">
        <h2 id="why-heading" className="font-heading text-4xl">
          Why this exists
        </h2>
        <p className="mt-4 font-body text-content-muted">
          Exam questions change. Fundamentals do not. What k-means clustering is, and the kind of
          problem it belongs to, reads the same today as it will in ten years — so that is what
          these notes cover, and it is why they stay worth reading once the exam is behind you.
        </p>
        <p className="mt-3 font-body text-content-muted">
          That is the study strategy, not a limit on scope. A memorised answer only helps with a
          question you have already seen. Understanding why a technique exists and when it applies
          means an unfamiliar question is still answerable — reason from the fundamentals and they
          lead to exactly one correct answer.
        </p>
        <p className="mt-3 font-body text-content-muted">
          Every card cites the section it came from, so you can go back to the reasoning instead of
          taking an answer on trust.
        </p>
        <p className="mt-6 font-body text-sm text-content-subtle">
          Progress is stored in this browser only — there is no account and nothing leaves your
          machine.{' '}
          <Link to="/courses" className="text-brand underline-offset-2 hover:underline">
            Pick a course
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
