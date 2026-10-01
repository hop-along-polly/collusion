import { Link, useParams } from 'react-router-dom'

import { courseSets, findDomain, listCourses } from '@/data/catalog'
import { listNoteRefs } from '@/data/content'
import { useNoteTitles } from '@/hooks/useContent'
import type { CourseMeta } from '@/types/cards'
import { pluralize } from '@/utils/format'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { NotFoundPage } from './NotFoundPage'

/**
 * Everything one company covers: its courses and its notes.
 *
 * Card sets are deliberately absent. A set is an authoring unit rather than a place to
 * study - flashcards are launched from a course so results are recorded against the
 * certification being prepared for.
 */

function CourseCard({ course }: { course: CourseMeta }) {
  const cards = courseSets(course).reduce((total, set) => total + set.cardCount, 0)

  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-heading text-2xl leading-none">
          <Link to={`/courses/${course.domainId}/${course.id}`} className="hover:text-brand">
            <span className="absolute inset-0 rounded-lg" aria-hidden="true" />
            {course.title}
          </Link>
        </h3>
        {course.subtitle ? (
          <span className="font-body text-sm text-content-subtle">{course.subtitle}</span>
        ) : null}
      </div>
      <p className="mt-3 font-body text-content-muted">{course.description}</p>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Badge tone={course.kind === 'certification' ? 'brand' : 'neutral'}>
          {course.kind === 'certification' ? 'Certification' : 'Study track'}
        </Badge>
        <Badge>{pluralize(cards, 'card')}</Badge>
      </div>
    </Card>
  )
}

export function DomainPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const domain = domainId ? findDomain(domainId) : undefined
  const courses = domainId ? listCourses(domainId) : []
  const noteRefs = domainId ? listNoteRefs(domainId) : []
  const titles = useNoteTitles(noteRefs)

  if (!domain) return <NotFoundPage />

  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="font-heading text-5xl leading-tight text-content-strong">{domain.title}</h1>
        <p className="mt-3 font-body text-lg text-content-muted">{domain.description}</p>
      </header>

      {courses.length === 0 && noteRefs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={domain.icon}
            title={`No ${domain.title} content yet`}
            description={
              <>
                There are no {domain.title} courses or topics available yet. Everything else in
                the library is ready to study in the meantime.
              </>
            }
            action={
              <>
                <ButtonLink to="/" variant="outline">
                  <Icon name="arrow-left" size={16} />
                  Back to domains
                </ButtonLink>
                <ButtonLink to="/courses">Study something else</ButtonLink>
              </>
            }
          />
        </div>
      ) : null}

      {courses.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-3xl text-content-strong">Courses</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      {noteRefs.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-heading text-3xl text-content-strong">Notes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {noteRefs.map((ref) => (
              <Card key={ref.file} interactive className="flex flex-col">
                <h3 className="font-heading text-xl leading-snug">
                  <Link to={`/notes/${ref.domainId}/${ref.id}`} className="hover:text-brand">
                    <span className="absolute inset-0 rounded-lg" aria-hidden="true" />
                    {titles.get(ref.file) ?? ref.id}
                  </Link>
                </h3>
                <p className="mt-2 font-mono text-xs text-content-subtle">{ref.file}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
