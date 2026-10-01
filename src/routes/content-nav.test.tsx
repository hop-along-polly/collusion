// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
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

  it('renders the study guide and links the sets the course quizzes', async () => {
    renderAt('/courses/aws/aif-c01')

    expect(
      await screen.findByRole('heading', { name: /AWS Certified AI Practitioner/, level: 1 }),
    ).toBeTruthy()

    // The guide is Markdown on disk; "Topics covered" is one of its headings.
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Topics covered/ })).toBeTruthy()
    })

    // Both generated sets are reachable. Each is linked twice by design - once from the
    // guide's topic table and once from the flashcards panel - so assert presence, not
    // uniqueness.
    expect(screen.getAllByRole('link', { name: /Concepts & Metrics/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /AWS Services/ }).length).toBeGreaterThan(0)
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
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Note source' })).toBeTruthy()
    })
  })
})
