import { useEffect, useState } from 'react'

import { courseSets } from '@/data/catalog'
import { loadCardSet } from '@/data/loader'
import type { CourseMeta } from '@/types/cards'
import type { CourseDeckEntry } from '@/quiz/deck'
import type { AsyncState } from './useCardSet'

/**
 * Loads every card set a course quizzes.
 *
 * Each set is its own lazy chunk, so they are fetched in parallel and the session waits
 * for all of them — a course quiz that started before its last set arrived would be
 * missing cards without saying so.
 */
export function useCourseSets(course: CourseMeta | undefined): AsyncState<CourseDeckEntry[]> {
  const [state, setState] = useState<AsyncState<CourseDeckEntry[]>>({ status: 'loading' })

  // `courseSets` rebuilds its array each call, so key the effect on the ids instead.
  const key = course ? `${course.path}:${course.setIds.join(',')}` : ''

  useEffect(() => {
    if (!course) return

    let active = true
    setState({ status: 'loading' })

    Promise.all(
      courseSets(course).map(async (meta) => ({ meta, set: await loadCardSet(meta) })),
    )
      .then((entries) => {
        if (active) setState({ status: 'ready', data: entries })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
