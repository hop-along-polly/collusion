// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { courseSets, findCourse } from '@/data/catalog'
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
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{"sets":{}}')
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

  it('records an answer against the set the card came from, not the course', async () => {
    const user = userEvent.setup()
    renderAt('/courses/aws/aif-c01/quiz')

    const submit = await screen.findByRole('button', { name: /submit answer/i })
    const options = await screen.findAllByRole('checkbox').catch(() => [])
    const radios = options.length > 0 ? options : await screen.findAllByRole('radio')

    await user.click(radios[0] as HTMLElement)
    await user.click(submit)

    await waitFor(() => {
      const snapshot = storedSnapshot()
      const setKeys = Object.keys(snapshot.sets)
      // Progress lands under a real set path, never under a course key.
      expect(setKeys.length).toBe(1)
      expect(courseSets(AIF).map((set) => set.path)).toContain(setKeys[0])
      expect(setKeys[0]?.startsWith('course:')).toBe(false)
    })
  })

  it('stores the card under its own id, with no session namespacing leaked in', async () => {
    const user = userEvent.setup()
    renderAt('/courses/aws/aif-c01/quiz')

    const submit = await screen.findByRole('button', { name: /submit answer/i })
    const radios = await screen.findAllByRole('radio').catch(async () => screen.findAllByRole('checkbox'))
    await user.click(radios[0] as HTMLElement)
    await user.click(submit)

    await waitFor(() => {
      const snapshot = storedSnapshot()
      const setKey = Object.keys(snapshot.sets)[0]!
      const cardIds = Object.keys(snapshot.sets[setKey].cards)
      expect(cardIds.length).toBe(1)
      // `::` is the session namespace separator; a stored id carrying it would mean the
      // same card could never be matched again from its own set page.
      expect(cardIds[0]).not.toContain('::')
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
