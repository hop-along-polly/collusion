import { Link } from 'react-router-dom'

import { courseSets, findDomain, listCourses } from '@/data/catalog'
import type { CourseMeta } from '@/types/cards'
import { pluralize } from '@/utils/format'
import { Badge, Card } from '@/components/ui/Surface'

function CourseCard({ course }: { course: CourseMeta }) {
  const domain = findDomain(course.domainId)
  const sets = courseSets(course)
  const cards = sets.reduce((total, set) => total + set.cardCount, 0)

  return (
    <Card interactive className="flex h-full flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-heading text-3xl leading-none">
          <Link to={`/courses/${course.domainId}/${course.id}`} className="hover:text-brand">
            <span className="absolute inset-0 rounded-lg" aria-hidden="true" />
            {course.title}
          </Link>
        </h2>
        {course.subtitle ? (
          <span className="font-body text-sm text-content-subtle">{course.subtitle}</span>
        ) : null}
      </div>

      <p className="mt-3 font-body text-content-muted">{course.description}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {/* A track has no exam behind it, so say so rather than implying a certification. */}
        <Badge tone={course.kind === 'certification' ? 'brand' : 'neutral'}>
          {course.kind === 'certification' ? 'Certification' : 'Study track'}
        </Badge>
        {domain ? <Badge>{domain.title}</Badge> : null}
        <Badge>{pluralize(cards, 'card')}</Badge>
      </div>
    </Card>
  )
}

export function CoursesPage() {
  const courses = listCourses()

  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="font-heading text-5xl leading-tight text-content-strong">Courses</h1>
        <p className="mt-3 font-body text-lg text-content-muted">
          Each course is a study guide: the topics one exam covers, the notes to read for them,
          and the flashcards that test them. Study tracks work the same way but have no exam
          behind them.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={`${course.domainId}/${course.id}`} course={course} />
        ))}
      </div>
    </div>
  )
}
