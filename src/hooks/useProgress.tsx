import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { ProgressSnapshot, CourseProgressSummary } from '@/types/progress'
import * as store from '@/storage/progress'

/**
 * One progress document for the whole app, held in context so the landing page, set
 * pages and quiz all read the same state without prop-drilling. Every mutation goes
 * through the pure functions in `storage/progress`, then persists.
 */
interface ProgressContextValue {
  snapshot: ProgressSnapshot
  recordAnswer: (courseKey: string, cardId: string, isCorrect: boolean) => void
  setMarked: (courseKey: string, cardId: string, marked: boolean) => void
  completeSession: (courseKey: string) => void
  resetCourse: (courseKey: string) => void
  summarize: (courseKey: string, cardIds: string[]) => CourseProgressSummary
  reviewableCardIds: (courseKey: string, cardIds: string[]) => string[]
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  // Read once on mount rather than in an effect, so the first paint already reflects
  // saved progress instead of flashing an empty state.
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>(store.loadProgress)

  useEffect(() => {
    store.saveProgress(snapshot)
  }, [snapshot])

  const value = useMemo<ProgressContextValue>(
    () => ({
      snapshot,
      recordAnswer: (courseKey, cardId, isCorrect) =>
        setSnapshot((current) => store.recordAnswer(current, courseKey, cardId, isCorrect)),
      setMarked: (courseKey, cardId, marked) =>
        setSnapshot((current) => store.setMarked(current, courseKey, cardId, marked)),
      completeSession: (courseKey) => setSnapshot((current) => store.completeSession(current, courseKey)),
      resetCourse: (courseKey) => setSnapshot((current) => store.resetCourse(current, courseKey)),
      summarize: (courseKey, cardIds) => store.summarize(snapshot, courseKey, cardIds),
      reviewableCardIds: (courseKey, cardIds) => store.reviewableCardIds(snapshot, courseKey, cardIds),
    }),
    [snapshot],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used inside a <ProgressProvider>')
  return context
}
