// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { courseSets, findCourse } from '@/data/catalog'
import { ProgressProvider } from '@/hooks/useProgress'

/**
 * Navigation across the three entities - courses, notes and card sets - against the real
 * catalog and the real Markdown files. Nothing is mocked: the point is that a study guide
 * on disk renders and its links land somewhere real.
 */

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </MemoryRouter>,
  )
}

describe('courses', () => {
  it('lists courses and distinguishes certifications from tracks', async () => {
    renderAt('/courses')

    expect(await screen.findByRole('heading', { name: 'Courses', level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /AWS Certified AI Practitioner/ })).toBeTruthy()
    // A track has no exam behind it and must not be presented as a certification.
    expect(screen.getAllByText('Study track').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Certification').length).toBeGreaterThan(0)
  })

  it('renders the study guide and names every set the course quizzes', async () => {
    renderAt('/courses/aws/aif-c01')

    expect(
      await screen.findByRole('heading', { name: /AWS Certified AI Practitioner/, level: 1 }),
    ).toBeTruthy()

    // The guide is Markdown on disk; "Topics covered" is one of its headings.
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Topics covered/ })).toBeTruthy()
    })

    // Every set is named, by the flashcards panel and by the guide's topic table.
    const sets = courseSets(findCourse('aws', 'aif-c01')!)
    expect(sets.length).toBeGreaterThan(1)
    for (const set of sets) {
      expect(screen.getAllByText(set.title).length).toBeGreaterThan(0)
    }

    // Named, not linked. A set has no page, because a session runs a whole course and
    // results are recorded against the certification. This assertion used to require the
    // opposite, which is how 47 links to a route that does not exist survived in the
    // guides: the test asserted the bug. Checked by href, since a set title and a note
    // title can coincide.
    const setPaths = sets.map((set) => `/${set.path}`)
    for (const link of screen.getAllByRole('link')) {
      expect(setPaths).not.toContain(link.getAttribute('href'))
    }
  })

  it('renders a 404 for a course that does not exist', () => {
    renderAt('/courses/aws/not-a-course')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/isn't here/i)
  })
})

describe('notes', () => {
  it('lists notes grouped by domain, titled from their first heading', async () => {
    renderAt('/notes')

    expect(await screen.findByRole('heading', { name: 'Notes', level: 1 })).toBeTruthy()
    // Titles arrive asynchronously because reading one means loading the file.
    expect(
      await screen.findByRole('link', { name: 'AWS Certified AI Practitioner (AIF-C01)' }),
    ).toBeTruthy()
  })

  it('renders a note and cross-links the courses that read it', async () => {
    renderAt('/notes/aws/ai_practitioner')

    expect(
      await screen.findByRole('heading', { name: /AWS Certified AI Practitioner/, level: 1 }),
    ).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Read for' })).toBeTruthy()
    expect(
      screen.getAllByRole('link', { name: /AWS Certified AI Practitioner/ }).length,
    ).toBeGreaterThan(0)
  })

  it('renders a 404 for a note that does not exist', () => {
    renderAt('/notes/aws/not-a-note')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/isn't here/i)
  })

  it('gives every heading an id, so a note can link to its own sections', async () => {
    // The long reference notes open with their own table of contents. Those `#section`
    // links are inert unless `rehype-slug` has put an id on the heading, and nothing else
    // in the app would notice if the plugin were dropped.
    renderAt('/notes/aws/all_aws_services')

    const toc = await screen.findByRole('link', { name: 'Networking and Content Delivery' })
    const target = toc.getAttribute('href')?.replace('#', '')
    expect(target).toBe('networking-and-content-delivery')

    const heading = await screen.findByRole('heading', { name: 'Networking and Content Delivery' })
    expect(heading.id).toBe(target)
  })
})

describe('study guide links', () => {
  it('turns a relative note link into in-app navigation rather than a dead file path', async () => {
    const user = userEvent.setup()
    renderAt('/courses/devops/ansible')

    // The guide's topic table links ../../notes/devops/Ansible.md from every row, so take
    // the first. Each must resolve to the in-app route rather than a dead .md path.
    const noteLinks = await screen.findAllByRole('link', { name: 'Ansible.md' })
    const noteLink = noteLinks[0]!
    expect(noteLink.getAttribute('href')).toBe('/notes/devops/Ansible')

    await user.click(noteLink)
    // The note's own first heading, so this proves the note rendered rather than just that
    // some page did.
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ansible Fundamentals', level: 1 })).toBeTruthy()
    })
  })
})
