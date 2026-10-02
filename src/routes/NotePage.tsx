import { Link, useParams } from 'react-router-dom'

import { coursesForNote, findDomain } from '@/data/catalog'
import { findNoteRef } from '@/data/content'
import { useNote } from '@/hooks/useContent'
import { Markdown } from '@/components/Markdown'
import { EmptyState } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Badge, Card } from '@/components/ui/Surface'
import { NotFoundPage } from './NotFoundPage'

export function NotePage() {
  const { domainId, noteId } = useParams<{ domainId: string; noteId: string }>()
  const ref = domainId && noteId ? findNoteRef(domainId, noteId) : undefined
  const domain = domainId ? findDomain(domainId) : undefined
  const note = useNote(ref)

  if (!ref || !domain) return <NotFoundPage />

  /**
   * Courses that read this note. There is deliberately no way to start flashcards from
   * here: a session has to be launched from a course so its results are recorded against
   * the certification being studied for.
   */
  const courses = coursesForNote(ref.file)

  return (
    <div>
      <Link
        to="/notes"
        className="inline-flex items-center gap-1.5 font-body text-sm text-content-muted hover:text-content"
      >
        <Icon name="arrow-left" size={16} />
        All notes
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0">
          {note.status === 'loading' ? (
            <p className="font-body text-content-muted">Loading the note…</p>
          ) : note.status === 'error' ? (
            <EmptyState title="The note could not be loaded" description={note.error.message} />
          ) : (
            <Markdown>{note.data.body}</Markdown>
          )}
        </Card>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {courses.length > 0 ? (
            <Card tone="parchment">
              <h2 className="font-heading text-2xl">Flashcards</h2>
              <p className="mt-2 font-body text-sm text-content-muted">
                Cards from this note are quizzed as part of the course you are studying for,
                so results count toward that certification.
              </p>
              <h3 className="mt-4 font-heading text-base text-content-strong">Read for</h3>
              <ul className="mt-3 space-y-2">
                {courses.map((course) => (
                  <li key={`${course.domainId}/${course.id}`} className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/courses/${course.domainId}/${course.id}`}
                      className="font-body text-brand underline-offset-2 hover:underline"
                    >
                      {course.title}
                    </Link>
                    <Badge tone={course.kind === 'certification' ? 'brand' : 'neutral'}>
                      {course.kind === 'certification' ? 'Certification' : 'Track'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

        </div>
      </div>
    </div>
  )
}
