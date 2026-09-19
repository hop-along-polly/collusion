// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { ProgressProvider } from '@/hooks/useProgress'
import { STORAGE_KEY } from '@/storage/progress'
import { findSet, listSets } from '@/data/catalog'

/**
 * Counts come from the catalog rather than being hard-coded. Card sets grow as notes
 * are added, and a literal here turns every content change into a test failure that
 * says nothing useful.
 */
const AGENT_SKILLS = findSet('anthropic', 'agent-skills')!

/**
 * Integration coverage for the screens a learner actually touches. These tests drive
 * the real card data from `/data`, so they also prove the loader, the catalog and the
 * routing all line up — and they assert on accessible roles and names rather than on
 * class names, so they double as a check that the a11y semantics are present.
 */

function renderAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
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

    expect(await screen.findByRole('heading', { name: /study what you actually wrote down/i })).toBeTruthy()
    for (const domain of ['Anthropic', 'DevOps', 'AWS']) {
      expect(screen.getByRole('heading', { name: domain, level: 3 })).toBeTruthy()
      expect(screen.getByRole('link', { name: new RegExp(`browse ${domain}`, 'i') })).toBeTruthy()
    }
  })
})

describe('a domain page', () => {
  it('lists the card sets belonging to that domain', async () => {
    renderAt('/aws')

    expect(await screen.findByRole('heading', { name: 'AWS', level: 1 })).toBeTruthy()

    // Every set the catalog places in this domain gets a heading and a link.
    const sets = listSets('aws')
    expect(sets.length).toBeGreaterThan(0)
    for (const set of sets) {
      expect(screen.getByRole('heading', { name: set.title, level: 2 })).toBeTruthy()
    }
  })
})

describe('an unknown route', () => {
  it('renders the not-found state rather than a blank page', async () => {
    renderAt('/anthropic/does-not-exist')

    expect(await screen.findByRole('heading', { name: /that page isn't here/i })).toBeTruthy()
  })
})

describe('the set page', () => {
  it('loads cards lazily and offers practice once they arrive', async () => {
    renderAt('/anthropic/agent-skills')

    expect(await screen.findByRole('link', { name: /start practice/i })).toBeTruthy()
    // Review mode is hidden until there is something to review.
    expect(screen.queryByRole('link', { name: /^review /i })).toBeNull()
    expect(screen.getByRole('link', { name: /agent_skills\.md/ })).toBeTruthy()
  })
})

describe('the quiz flow', () => {
  it('grades on submit, reveals an explanation with citations, then advances', async () => {
    const user = userEvent.setup()
    renderAt('/anthropic/agent-skills/quiz?mode=practice')

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
    expect(screen.getAllByRole('link', { name: /agent_skills\.md/ }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /submit answer/i })).toBeNull()

    // Options are frozen once graded.
    expect((options[0] as HTMLInputElement).disabled).toBe(true)

    await user.click(screen.getByRole('button', { name: /next question|see results/i }))
    await waitFor(() => {
      expect(screen.getByText(`2 / ${AGENT_SKILLS.cardCount}`)).toBeTruthy()
    })
  })

  it('persists progress, so review mode appears on the set page afterwards', async () => {
    const user = userEvent.setup()
    renderAt('/anthropic/agent-skills/quiz?mode=practice')

    const group = await screen.findByRole('group')
    const inputs = within(group).getAllByRole(
      group.querySelector('input[type="checkbox"]') ? 'checkbox' : 'radio',
    )

    await user.click(inputs[0] as HTMLElement)
    await user.click(screen.getByRole('button', { name: /submit answer/i }))
    // Star the card so it is reviewable regardless of whether the guess was right.
    await user.click(screen.getByRole('button', { name: /mark for review/i }))

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"attempts":1')
    })

    cleanup()
    renderAt('/anthropic/agent-skills')

    expect(await screen.findByRole('link', { name: /review 1 card/i })).toBeTruthy()
  })

  it('ends a session early and shows results with a route back', async () => {
    const user = userEvent.setup()
    renderAt('/anthropic/agent-skills/quiz?mode=practice')

    await screen.findByRole('group')
    await user.click(screen.getByRole('button', { name: /end session/i }))

    expect(await screen.findByRole('heading', { name: /session ended/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /run it again/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to agent skills/i })).toBeTruthy()
  })

  it('explains the empty review queue rather than showing an empty quiz', async () => {
    renderAt('/anthropic/agent-skills/quiz?mode=review')

    expect(await screen.findByRole('heading', { name: /nothing to review yet/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /practice all cards/i })).toBeTruthy()
  })
})
