import { Link, useParams } from 'react-router-dom'

import { courseSets, findCourse, findDomain } from '@/data/catalog'
import { githubUrl } from '@/data/content'
import { useCourseGuide } from '@/hooks/useContent'
import { useProgress } from '@/hooks/useProgress'
import { getSetProgress } from '@/storage/progress'
import type { CardSetMeta } from '@/types/cards'
import { pluralize } from '@/utils/format'
import { Markdown } from '@/components/Markdown'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState, ProgressBar } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { NotFoundPage } from './NotFoundPage'

/** Kept in step with `SESSION_SIZE` in `CourseQuizPage`. */
const COURSE_SESSION_SIZE = 40

function SetRow({ set }: { set: CardSetMeta }) {
  const { snapshot } = useProgress()
  const progress = getSetProgress(snapshot, set.path)
  const attempted = Object.values(progress.cards).filter((card) => card.attempts > 0).length

  return (
    <li className="border-b border-line py-4 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-heading text-xl">
          <Link to={`/${set.domainId}/${set.id}`} className="hover:text-brand">
            {set.title}
          </Link>
        </h3>
        <span className="font-body text-sm text-content-subtle">
          {pluralize(set.cardCount, 'card')}
        </span>
      </div>
      {attempted > 0 ? (
        <div className="mt-2">
          <ProgressBar
            value={attempted}
            max={set.cardCount}
            label={`${set.title}: ${attempted} of ${set.cardCount} cards seen`}
          />
        </div>
      ) : null}
    </li>
  )
}

export function CoursePage() {
  const { domainId, courseId } = useParams<{ domainId: string; courseId: string }>()
  const course = domainId && courseId ? findCourse(domainId, courseId) : undefined
  const domain = domainId ? findDomain(domainId) : undefined
  const guide = useCourseGuide(course)

  if (!course || !domain) return <NotFoundPage />

  const sets = courseSets(course)
  const totalCards = sets.reduce((total, set) => total + set.cardCount, 0)
  // The study guide lists sets in study order, so the first is where a learner starts.
  const first = sets[0]

  return (
    <div>
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 font-body text-sm text-content-muted hover:text-content"
      >
        <Icon name="arrow-left" size={16} />
        All courses
      </Link>

      <header className="mt-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={course.kind === 'certification' ? 'brand' : 'neutral'}>
            {course.kind === 'certification' ? 'Certification' : 'Study track'}
          </Badge>
          <Badge>{domain.title}</Badge>
        </div>
        <h1 className="mt-3 font-heading text-5xl leading-tight text-content-strong">
          {course.title}
        </h1>
        {course.subtitle ? (
          <p className="mt-1 font-body text-lg text-content-subtle">{course.subtitle}</p>
        ) : null}
        <p className="mt-3 font-body text-lg text-content-muted">{course.description}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0">
          {guide.status === 'loading' ? (
            <p className="font-body text-content-muted">Loading the study guide…</p>
          ) : guide.status === 'error' ? (
            <EmptyState
              title="The study guide could not be loaded"
              description={guide.error.message}
            />
          ) : (
            <Markdown>{guide.data}</Markdown>
          )}
        </Card>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card tone="parchment">
            <h2 className="font-heading text-2xl">Flashcards</h2>
            <p className="mt-2 font-body text-sm text-content-muted">
              {pluralize(totalCards, 'card')} across {pluralize(sets.length, 'set')}.
            </p>

            {first ? (
              <>
                <ul className="mt-4">
                  {sets.map((set) => (
                    <SetRow key={set.id} set={set} />
                  ))}
                </ul>
                <ButtonLink
                  to={`/courses/${course.path}/quiz`}
                  size="lg"
                  className="mt-5 w-full justify-center"
                >
                  <Icon name="target" size={18} />
                  Start course quiz
                </ButtonLink>
                {/*
                  A course quiz draws a shuffled sample rather than every card, so say so
                  here instead of letting the session's count come as a surprise.
                */}
                <p className="mt-2 text-center font-body text-xs text-content-subtle">
                  {totalCards > COURSE_SESSION_SIZE
                    ? `${COURSE_SESSION_SIZE} cards drawn from all ${sets.length} sets, reshuffled each time.`
                    : 'Every card from every set in this course.'}
                </p>
              </>
            ) : (
              <p className="mt-4 font-body text-sm text-content-muted">
                No flashcards have been generated for this course yet.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-heading text-xl">Study guide source</h2>
            <p className="mt-2 font-body text-sm text-content-muted">
              This page renders a Markdown file kept in the repository.
            </p>
            <a
              href={githubUrl(`courses/${course.path}.md`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-brand underline-offset-2 hover:underline"
            >
              <Icon name="external" size={14} />
              courses/{course.path}.md
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
