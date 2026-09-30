import { Link, useParams } from 'react-router-dom'

import { catalog, coursesForNote, findDomain } from '@/data/catalog'
import { findNoteRef, githubUrl } from '@/data/content'
import { useNote } from '@/hooks/useContent'
import { pluralize } from '@/utils/format'
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

  // Which card sets were built from this note, and which courses read it.
  const sets = catalog.sets.filter((set) => set.sources.includes(ref.file))
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
          <Card tone="parchment">
            <h2 className="font-heading text-2xl">Test yourself</h2>
            {sets.length > 0 ? (
              <>
                <p className="mt-2 font-body text-sm text-content-muted">
                  {pluralize(sets.length, 'card set')} drawn from this note.
                </p>
                <ul className="mt-3 space-y-2">
                  {sets.map((set) => (
                    <li key={set.id}>
                      <Link
                        to={`/${set.domainId}/${set.id}`}
                        className="font-body text-brand underline-offset-2 hover:underline"
                      >
                        {set.title}
                      </Link>
                      <span className="ml-2 font-body text-sm text-content-subtle">
                        {pluralize(set.cardCount, 'card')}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 font-body text-sm text-content-muted">
                No flashcards have been generated from this note yet.
              </p>
            )}
          </Card>

          {courses.length > 0 ? (
            <Card>
              <h2 className="font-heading text-xl">Read for</h2>
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

          <Card>
            <h2 className="font-heading text-xl">Note source</h2>
            <a
              href={githubUrl(ref.file)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 break-all font-mono text-sm text-brand underline-offset-2 hover:underline"
            >
              <Icon name="external" size={14} className="shrink-0" />
              {ref.file}
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
