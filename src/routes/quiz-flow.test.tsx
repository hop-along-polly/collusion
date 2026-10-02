// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { courseSets, findCourse, listCourses } from '@/data/catalog'
import { ProgressProvider } from '@/hooks/useProgress'
import { STORAGE_KEY } from '@/storage/progress'

/**
 * Integration coverage for the screens a learner actually touches. These tests drive the
 * real card data from `/flashcards`, so they also prove the loader, the catalog and the
 * routing all line up - and they assert on accessible roles and names rather than on class
 * names, so they double as a check that the a11y semantics are present.
 *
 * Sessions are always launched from a course: a card set is an authoring unit with no page
 * of its own, because results are recorded against the certification being studied for.
 */

/** A small course, so a full session is cheap to drive. */
const ANSIBLE = findCourse('devops', 'ansible')!
const ANSIBLE_CARDS = courseSets(ANSIBLE).reduce((total, set) => total + set.cardCount, 0)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(cleanup)

describe('landing page', () => {
  it('lists every domain in the catalog with a route into it', async () => {
    renderAt('/')

    expect(await screen.findByRole('heading', { name: /know the material before exam day/i })).toBeTruthy()
    for (const domain of ['Anthropic', 'DevOps', 'AWS']) {
      expect(screen.getByRole('heading', { name: domain, level: 3 })).toBeTruthy()
      expect(screen.getByRole('link', { name: new RegExp(`browse ${domain}`, 'i') })).toBeTruthy()
    }
  })
})

describe('a domain page', () => {
  it('lists the courses in that domain, not its card sets', async () => {
    renderAt('/devops')

    expect(await screen.findByRole('heading', { name: 'DevOps', level: 1 })).toBeTruthy()

    const courses = listCourses('devops')
    expect(courses.length).toBeGreaterThan(0)
    for (const course of courses) {
      // `getAllBy` because a course and a note can share a name - the Ansible course and
      // Ansible.md both render an h3 reading "Ansible".
      expect(screen.getAllByRole('heading', { name: course.title, level: 3 }).length).toBeGreaterThan(0)
    }

    // Note titles are read from the file, so they arrive after the first paint. Wait for
    // one before asserting on what the page links to, or the assertion below can pass
    // simply because the note card has not rendered its title yet.
    expect(await screen.findByRole('link', { name: 'Ansible Fundamentals' })).toBeTruthy()

    // A card set has no page, so nothing on this screen should link to one. Checked by
    // href, not by accessible name: the `ansible` set and `Ansible.md` are both titled
    // "Ansible Fundamentals", so a name-based assertion here was really asserting that
    // the note title had not loaded yet.
    const setPaths = courseSets(ANSIBLE).map((set) => `/${set.path}`)
    for (const link of screen.getAllByRole('link')) {
      expect(setPaths).not.toContain(link.getAttribute('href'))
    }
  })
})

describe('an unknown route', () => {
  it('renders the not-found state rather than a blank page', async () => {
    renderAt('/anthropic/does-not-exist')

    expect(await screen.findByRole('heading', { name: /that page isn't here/i })).toBeTruthy()
  })
})

describe('a course page', () => {
  it('offers a session once the catalog is read', async () => {
    renderAt('/courses/devops/ansible')

    expect(await screen.findByRole('link', { name: /start course quiz/i })).toBeTruthy()
  })
})

describe('the quiz flow', () => {
  it('grades on submit, reveals an explanation with citations, then advances', async () => {
    const user = userEvent.setup()
    renderAt('/courses/devops/ansible/quiz?mode=practice')

    const group = await screen.findByRole('group')
    const options = within(group).getAllByRole(
      // Cards are either radio (select one / true-false) or checkbox (select all).
      group.querySelector('input[type="checkbox"]') ? 'checkbox' : 'radio',
    )
    expect(options.length).toBeGreaterThanOrEqual(2)

    // Submit is blocked until something is selected.
    const submit = screen.getByRole('button', { name: /submit answer/i })
    expect((submit as HTMLButtonElement).disabled).toBe(true)

    await user.click(options[0] as HTMLElement)
    expect((screen.getByRole('button', { name: /submit answer/i }) as HTMLButtonElement).disabled).toBe(false)

    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    // Feedback replaces the submit control with an advance control.
    const verdict = await screen.findByRole('heading', { level: 2 })
    expect(/correct|not quite/i.test(verdict.textContent ?? '')).toBe(true)
    expect(screen.getByRole('heading', { name: /^sources?$/i })).toBeTruthy()

    // Citations go to the note's own page in the app, never out to the repository. That is
    // deliberate: following a source should not advertise where the content is kept.
    const sources = screen.getAllByRole('link', { name: /Ansible\.md/ })
    expect(sources.length).toBeGreaterThan(0)
    for (const source of sources) {
      const href = source.getAttribute('href') ?? ''
      expect(href.startsWith('/notes/devops/Ansible')).toBe(true)
      expect(href).not.toMatch(/github\.com/)
    }
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull()

    // Options are frozen once graded.
    expect((options[0] as HTMLInputElement).disabled).toBe(true)

    await user.click(screen.getByRole('button', { name: /next question|see results/i }))
    await waitFor(() => {
      expect(screen.getByText(`2 / ${ANSIBLE_CARDS}`)).toBeTruthy()
    })
  })

  it('persists progress against the course, so review mode has something to show', async () => {
    const user = userEvent.setup()
    renderAt('/courses/devops/ansible/quiz?mode=practice')

    const group = await screen.findByRole('group')
    const inputs = within(group).getAllByRole(
      group.querySelector('input[type="checkbox"]') ? 'checkbox' : 'radio',
    )

    await user.click(inputs[0] as HTMLElement)
    await user.click(screen.getByRole('button', { name: /submit answer/i }))
    // Star the card so it is reviewable regardless of whether the guess was right.
    await user.click(screen.getByRole('button', { name: /mark for review/i }))

    await waitFor(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? ''
      expect(raw).toContain('"attempts":1')
      // Filed under the course, not under a card set.
      expect(JSON.parse(raw).courses[ANSIBLE.path]).toBeTruthy()
    })

    cleanup()
    renderAt('/courses/devops/ansible/quiz?mode=review')

    // The starred card is the only thing in the review queue.
    expect(await screen.findByRole('group')).toBeTruthy()
    expect(screen.getByText('1 / 1')).toBeTruthy()
  })

  it('ends a session early and shows results with a route back', async () => {
    const user = userEvent.setup()
    renderAt('/courses/devops/ansible/quiz?mode=practice')

    await screen.findByRole('group')
    await user.click(screen.getByRole('button', { name: /end session/i }))

    expect(await screen.findByRole('heading', { name: /session ended/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /run it again/i })).toBeTruthy()
    // The results panel and the trailing note both offer the way back.
    expect(screen.getAllByRole('link', { name: /back to ansible/i }).length).toBeGreaterThan(0)
  })

  it('explains the empty review queue rather than showing an empty quiz', async () => {
    renderAt('/courses/devops/ansible/quiz?mode=review')

    expect(await screen.findByRole('heading', { name: /nothing to review yet/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /practice all cards/i })).toBeTruthy()
  })
})
