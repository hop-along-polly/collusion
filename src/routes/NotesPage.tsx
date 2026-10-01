import { Link } from 'react-router-dom'

import { findDomain, listDomains } from '@/data/catalog'
import { listNoteRefs } from '@/data/content'
import { useNoteTitles } from '@/hooks/useContent'
import { Card } from '@/components/ui/Surface'

export function NotesPage() {
  const refs = listNoteRefs()
  const titles = useNoteTitles(refs)
  const domains = listDomains().filter((domain) => refs.some((ref) => ref.domainId === domain.id))

  return (
    <div>
      <header className="max-w-3xl">
        <h1 className="font-heading text-5xl leading-tight text-content-strong">Notes</h1>
        <p className="mt-3 font-body text-lg text-content-muted">
          The course material, hand-written by practitioners who hold these certifications. One
          topic per page. To study for a specific exam, open its course instead - it lists these
          topics in reading order.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        {domains.map((domain) => {
          const domainNotes = refs.filter((ref) => ref.domainId === domain.id)

          return (
            <section key={domain.id}>
              <h2 className="font-heading text-3xl text-content-strong">{domain.title}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {domainNotes.map((ref) => (
                  <Card key={ref.file} interactive className="flex flex-col">
                    <h3 className="font-heading text-xl leading-snug">
                      <Link to={`/notes/${ref.domainId}/${ref.id}`} className="hover:text-brand">
                        <span className="absolute inset-0 rounded-lg" aria-hidden="true" />
                        {/* The title is the note's first heading, so it arrives with the file. */}
                        {titles.get(ref.file) ?? ref.id}
                      </Link>
                    </h3>
                    <p className="mt-2 font-mono text-xs text-content-subtle">{ref.file}</p>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** Notes for a single domain, reached from the domain page. */
export function DomainNotesLink({ domainId }: { domainId: string }) {
  const count = listNoteRefs(domainId).length
  const domain = findDomain(domainId)
  if (count === 0 || !domain) return null

  return (
    <Link
      to="/notes"
      className="font-body text-sm text-brand underline-offset-2 hover:underline"
    >
      Browse the {count} {domain.title} notes
    </Link>
  )
}
