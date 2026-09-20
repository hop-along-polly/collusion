import { listDomains } from '@/data/catalog'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'

/**
 * Rendered both for unmatched routes and for a valid-looking URL whose domain or set
 * is not in the catalog — a stale bookmark after a set is renamed, for instance. Every
 * path out is a real destination, never just a "go back".
 */
export function NotFoundPage() {
  const domains = listDomains().filter((domain) => domain.status === 'available')

  return (
    <EmptyState
      icon="alert"
      level={1}
      title="That page isn't here"
      description="The domain or card set in this URL isn't in the catalog. It may have been renamed, or the link may be out of date."
      action={
        <>
          <ButtonLink to="/">
            <Icon name="arrow-left" size={16} />
            Back to all domains
          </ButtonLink>
          {domains.map((domain) => (
            <ButtonLink key={domain.id} to={`/${domain.id}`} variant="outline">
              {domain.title}
            </ButtonLink>
          ))}
        </>
      }
    />
  )
}
