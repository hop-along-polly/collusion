import { useEffect, useState } from 'react'

import { loadCourseGuide, loadNote, type Note, type NoteRef } from '@/data/content'
import type { CourseMeta } from '@/types/cards'
import type { AsyncState } from './useCardSet'

/**
 * Markdown loading hooks. Same shape as `useCardSet`: a lazy chunk per file, cached by
 * the loader, with an `active` flag so a fast navigation cannot resolve into an
 * unmounted component.
 */

export function useNote(ref: NoteRef | undefined): AsyncState<Note> {
  const [state, setState] = useState<AsyncState<Note>>({ status: 'loading' })

  useEffect(() => {
    if (!ref) return

    let active = true
    setState({ status: 'loading' })

    loadNote(ref)
      .then((data) => {
        if (active) setState({ status: 'ready', data })
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
  }, [ref])

  return state
}

export function useCourseGuide(course: CourseMeta | undefined): AsyncState<string> {
  const [state, setState] = useState<AsyncState<string>>({ status: 'loading' })

  useEffect(() => {
    if (!course) return

    let active = true
    setState({ status: 'loading' })

    loadCourseGuide(course)
      .then((data) => {
        if (active) setState({ status: 'ready', data })
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
  }, [course])

  return state
}

/**
 * Titles for a list of notes.
 *
 * A title is the note's first heading, which means reading the file. The index pages
 * need every title at once, so this fetches them in parallel and renders the list as
 * soon as all resolve. Bodies are cached, so opening a note afterwards is instant.
 */
export function useNoteTitles(refs: NoteRef[]): Map<string, string> {
  const [titles, setTitles] = useState<Map<string, string>>(new Map())
  const key = refs.map((ref) => ref.file).join('|')

  useEffect(() => {
    let active = true

    Promise.all(refs.map((ref) => loadNote(ref).catch(() => null)))
      .then((notes) => {
        if (!active) return
        const next = new Map<string, string>()
        for (const note of notes) {
          if (note) next.set(note.file, note.title)
        }
        setTitles(next)
      })
      .catch(() => {
        /* A failed title falls back to the id, which the caller already handles. */
      })

    return () => {
      active = false
    }
    // `key` is the stable identity of the ref list; `refs` is a new array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return titles
}
