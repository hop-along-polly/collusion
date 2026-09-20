import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { ProgressSnapshot, SetProgressSummary } from '@/types/progress'
import * as store from '@/storage/progress'

/**
 * One progress document for the whole app, held in context so the landing page, set
 * pages and quiz all read the same state without prop-drilling. Every mutation goes
 * through the pure functions in `storage/progress`, then persists.
 */
interface ProgressContextValue {
  snapshot: ProgressSnapshot
  recordAnswer: (setKey: string, cardId: string, isCorrect: boolean) => void
  setMarked: (setKey: string, cardId: string, marked: boolean) => void
  completeSession: (setKey: string) => void
  resetSet: (setKey: string) => void
  summarize: (setKey: string, cardIds: string[]) => SetProgressSummary
  reviewableCardIds: (setKey: string, cardIds: string[]) => string[]
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
      recordAnswer: (setKey, cardId, isCorrect) =>
        setSnapshot((current) => store.recordAnswer(current, setKey, cardId, isCorrect)),
      setMarked: (setKey, cardId, marked) =>
        setSnapshot((current) => store.setMarked(current, setKey, cardId, marked)),
      completeSession: (setKey) => setSnapshot((current) => store.completeSession(current, setKey)),
      resetSet: (setKey) => setSnapshot((current) => store.resetSet(current, setKey)),
      summarize: (setKey, cardIds) => store.summarize(snapshot, setKey, cardIds),
      reviewableCardIds: (setKey, cardIds) => store.reviewableCardIds(snapshot, setKey, cardIds),
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
