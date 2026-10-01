// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * The empty-state path for a domain that has no content yet.
 *
 * This lives in its own file because it mocks the catalog module, and Vitest module
 * mocks are file-scoped. Mocking is the right call here rather than leaning on a real
 * domain: every domain in `data/catalog.json` now has content, so a test asserting on
 * a real empty one would break the moment cards were added - which is exactly what
 * happened when AWS notes landed. The code path is real and worth covering; which
 * domain happens to be empty today is not.
 */

const PLANNED_DOMAIN = {
  id: 'azure',
  title: 'Azure',
  tagline: 'Notes pending.',
  description: 'No Azure notes exist in this repository yet.',
  status: 'planned' as const,
  icon: 'cloud' as const,
  order: 9,
}

vi.mock('@/data/catalog', () => ({
  catalog: { domains: [PLANNED_DOMAIN], sets: [], courses: [] },
  listDomains: () => [PLANNED_DOMAIN],
  findDomain: (id: string) => (id === PLANNED_DOMAIN.id ? PLANNED_DOMAIN : undefined),
  listSets: () => [],
  findSet: () => undefined,
  listCourses: () => [],
  findCourse: () => undefined,
  courseSets: () => [],
  coursesForNote: () => [],
  totalCardCount: () => 0,
}))

afterEach(cleanup)

describe('a domain with no card sets', () => {
  it('explains what is missing and offers a way forward instead of a dead end', async () => {
    const { App } = await import('@/App')
    const { ProgressProvider } = await import('@/hooks/useProgress')

    render(
      <MemoryRouter initialEntries={['/azure']}>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /no azure content yet/i })).toBeTruthy()
    // Addressed to a learner, so it says what is missing without naming repository paths
    // or asking them to edit a catalog file.
    expect(screen.getByText(/no azure courses or topics available yet/i)).toBeTruthy()
    expect(screen.queryByText(/catalog\.json/)).toBeNull()
    // Two real destinations, never just a "go back".
    expect(screen.getByRole('link', { name: /back to domains/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /study something else/i })).toBeTruthy()
  })
})
