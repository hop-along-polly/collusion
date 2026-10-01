// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from '@/App'

/**
 * Guards the stretched-link pattern used by every card grid: the card title holds the real
 * link, and an `absolute inset-0` overlay widens its hit area to the whole card.
 *
 * That overlay sizes itself against its nearest *positioned* ancestor. If the card is not
 * positioned, every overlay on the page sizes to the page instead, they stack, and the last
 * card in the DOM order captures every click - so clicking any course opened the last one.
 *
 * jsdom has no layout engine, so a click cannot reproduce that. What can be checked is the
 * invariant the layout depends on: each overlay must be scoped to its own card. An overlay
 * whose containing block holds a sibling overlay is the bug, by definition.
 */

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function overlaysOf(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('span[aria-hidden="true"]')).filter(
    (span) => span.classList.contains('absolute'),
  )
}

afterEach(cleanup)

describe.each([
  ['the courses index', '/courses'],
  ['the notes index', '/notes'],
  ['a domain page', '/devops'],
])('%s', (_name, path) => {
  it('scopes every card link overlay to its own card', async () => {
    const { container, findByRole } = renderAt(path)
    // Let the lazy catalog/notes loads settle so the grid is actually populated.
    await findByRole('heading', { level: 1 })

    const overlays = overlaysOf(container)
    expect(overlays.length).toBeGreaterThan(1)

    for (const overlay of overlays) {
      const containingBlock = overlay.closest('.relative')

      // Unpositioned ancestry is the original defect: the overlay would size to the page.
      expect(containingBlock).not.toBeNull()

      // And the containing block must be this card alone. Two overlays sharing one means
      // they are stacked on each other, and only the last one is clickable.
      expect(overlaysOf(containingBlock as HTMLElement)).toHaveLength(1)

      // The overlay must travel with its own link, or it widens the hit area of the wrong one.
      expect(containingBlock?.contains(overlay.closest('a'))).toBe(true)
    }
  })
})
