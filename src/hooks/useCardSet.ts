import { useEffect, useState } from 'react'

import { loadCardSet } from '@/data/loader'
import type { CardSet, CardSetMeta } from '@/types/cards'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: Error }

/**
 * Loads a card set's chunk on demand. Sets are cached by the loader, so revisiting a
 * set resolves on the next microtask rather than showing a second loading state.
 */
export function useCardSet(meta: CardSetMeta | undefined): AsyncState<CardSet> {
  const [state, setState] = useState<AsyncState<CardSet>>({ status: 'loading' })

  useEffect(() => {
    if (!meta) return

    let active = true
    setState({ status: 'loading' })

    loadCardSet(meta)
      .then((data) => {
        if (active) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
        }
      })

    return () => {
      active = false
    }
  }, [meta])

  return state
}
