// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { courseSets, findCourse } from '@/data/catalog'
import { loadCardSet } from '@/data/loader'
import { ProgressProvider } from '@/hooks/useProgress'
import { STORAGE_KEY } from '@/storage/progress'

/**
 * A course session runs the union of several card sets, which raises two problems a
 * single-set session never had: the union is far too large for one sitting, and a result
 * has to be filed against the set the card came from rather than against the course.
 * Both are covered here.
 */

const AIF = findCourse('aws', 'aif-c01')!
const SESSION_SIZE = 40

/** Every card id the course can serve, read from the real card files. */
const courseCardIds = new Set(
  (await Promise.all(courseSets(AIF).map((meta) => loadCardSet(meta)))).flatMap((set) =>
    set.cards.map((card) => card.id),
  ),
)

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

function storedSnapshot() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{"courses":{}}')
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(cleanup)

describe('a course quiz', () => {
  it('caps a practice session well below the size of the whole course', async () => {
    const totalCards = courseSets(AIF).reduce((sum, set) => sum + set.cardCount, 0)
    // The premise of the cap: this course has more cards than one session should serve.
    expect(totalCards).toBeGreaterThan(SESSION_SIZE)

    renderAt('/courses/aws/aif-c01/quiz')

    // The progress bar names the session length, so it is the unambiguous place to read
    // it: the session is capped at SESSION_SIZE rather than running the whole course.
    const bar = await screen.findByRole('progressbar', {
      name: new RegExp(`Question 1 of ${SESSION_SIZE}$`),
    })
    expect(bar).toBeTruthy()
    expect(
      screen.queryByRole('progressbar', { name: new RegExp(`of ${totalCards}$`) }),
    ).toBeNull()
  })

  it('records an answer against the course, not against a card set', async () => {
    const user = userEvent.setup()
    renderAt('/courses/aws/aif-c01/quiz')

    const submit = await screen.findByRole('button', { name: /submit answer/i })
    const options = await screen.findAllByRole('checkbox').catch(() => [])
    const radios = options.length > 0 ? options : await screen.findAllByRole('radio')

    await user.click(radios[0] as HTMLElement)
    await user.click(submit)

    await waitFor(() => {
      const keys = Object.keys(storedSnapshot().courses)
      // One bucket, named for the course being studied for — never for a card set.
      expect(keys).toEqual([AIF.path])
      expect(courseSets(AIF).map((set) => set.path)).not.toContain(keys[0])
    })
  })

  it('stores a card under its own id, with no set prefix to orphan on a rename', async () => {
    const user = userEvent.setup()
    renderAt('/courses/aws/aif-c01/quiz')

    const submit = await screen.findByRole('button', { name: /submit answer/i })
    const radios = await screen.findAllByRole('radio').catch(async () => screen.findAllByRole('checkbox'))
    await user.click(radios[0] as HTMLElement)
    await user.click(submit)

    await waitFor(() => {
      const cardIds = Object.keys(storedSnapshot().courses[AIF.path].cards)
      expect(cardIds.length).toBe(1)
      const stored = cardIds[0]!
      // No set prefix: a card's history has to survive its set being renamed or split.
      expect(stored).not.toContain('::')
      // And it is genuinely one of the course's card ids, written exactly as authored.
      expect(courseCardIds.has(stored)).toBe(true)
    })
  })

  it('offers the course quiz from the course page', async () => {
    renderAt('/courses/aws/aif-c01')

    const start = await screen.findByRole('link', { name: /start course quiz/i })
    expect(start.getAttribute('href')).toBe('/courses/aws/aif-c01/quiz')
  })

  it('explains that a course with no card sets has nothing to quiz', async () => {
    // Every course in the catalog has sets, so this drives the guard through a course id
    // that does not exist rather than mocking the catalog.
    renderAt('/courses/aws/not-a-course/quiz')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/isn't here/i)
  })
})
