import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { QuizRunner } from '@/components/quiz/QuizRunner'
import { EmptyState, Loading } from '@/components/ui/Feedback'
import { findCourse, findDomain } from '@/data/catalog'
import { useCourseSets } from '@/hooks/useCourseSets'
import { buildCourseDeck } from '@/quiz/deck'
import type { QuizMode } from '@/types/quiz'
import { NotFoundPage } from './NotFoundPage'

function parseMode(value: string | null): QuizMode {
  return value === 'review' ? 'review' : 'practice'
}

/**
 * How many cards one practice session draws from a course.
 *
 * A course is the union of its sets, which for CCAR-F is well over two hundred cards -
 * several sittings, not one. Capping keeps a session finishable while the shuffle means
 * repeated sessions still cover the whole course over time. Review mode ignores the cap,
 * because seeing everything still outstanding is the entire point of it.
 */
const SESSION_SIZE = 40

/** A session over every set a course quizzes. */
export function CourseQuizPage() {
  const { domainId, courseId } = useParams<{ domainId: string; courseId: string }>()
  const [searchParams] = useSearchParams()
  const mode = parseMode(searchParams.get('mode'))
  const [attempt, setAttempt] = useState(0)

  const course = domainId && courseId ? findCourse(domainId, courseId) : undefined
  const domain = domainId ? findDomain(domainId) : undefined
  const state = useCourseSets(course)

  const deck = useMemo(
    () => (course && state.status === 'ready' ? buildCourseDeck(course, state.data, SESSION_SIZE) : undefined),
    [course, state],
  )

  if (!course || !domain) return <NotFoundPage />
  if (state.status === 'loading') return <Loading label={`Loading ${course.title}`} />
  if (state.status === 'error') return <NotFoundPage />

  if (!deck || deck.cards.length === 0) {
    return (
      <EmptyState
        icon="target"
        level={1}
        title="This course has no flashcards yet"
        description="Its study guide is ready, but no card sets have been generated for it."
        action={
          <Link to={`/courses/${course.path}`} className="text-brand underline-offset-2 hover:underline">
            Back to {course.title}
          </Link>
        }
      />
    )
  }

  return (
    <QuizRunner
      key={`${deck.progressKey}:${mode}:${attempt}`}
      deck={deck}
      mode={mode}
      onRestart={() => setAttempt((value) => value + 1)}
      footer={
        <p className="font-body text-sm text-content-subtle">
          Results are recorded against {course.title} specifically, so studying a shared
          topic for another certification does not move this one.{' '}
          <Link to={`/courses/${course.path}`} className="text-brand underline-offset-2 hover:underline">
            Back to {course.title}
          </Link>
        </p>
      }
    />
  )
}
