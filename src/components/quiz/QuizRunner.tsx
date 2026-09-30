import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'

import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, ProgressBar, Stat } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Alert, Badge, Card } from '@/components/ui/Surface'
import { gradeCard } from '@/engine/grade'
import { createQuiz, createQuizReducer, missedCardIds, selectView } from '@/engine/quiz'
import { randomSeed, shuffle } from '@/engine/shuffle'
import { useProgress } from '@/hooks/useProgress'
import { groupBySet, type Deck } from '@/quiz/deck'
import type { Card as CardType } from '@/types/cards'
import type { QuizMode, QuizStats } from '@/types/quiz'
import { pluralize } from '@/utils/format'

/**
 * Runs one quiz session over a `Deck`.
 *
 * Extracted from `QuizPage` so a course session — the union of several sets — reuses the
 * flow rather than copying it. Everything set-specific now arrives through the deck, and
 * results are written back through `deck.originOf` so each card's progress lands on the
 * set it actually came from, no matter which page started the session.
 */

interface QuizRunnerProps {
  deck: Deck
  mode: QuizMode
  /** Bumped by the caller to start a fresh session with the same deck. */
  onRestart: () => void
  /** Trailing link on the results screen, e.g. back to the domain. */
  footer?: React.ReactNode
}

export function QuizRunner({ deck, mode, onRestart, footer }: QuizRunnerProps) {
  const progress = useProgress()

  /**
   * The card list and the starting marks are captured once, at mount.
   *
   * `useState`'s lazy initialiser is doing real work here: reading them through
   * `useMemo` would recompute as answers land (the snapshot changes on every submit),
   * and cards would disappear from a review session the moment they were answered
   * correctly. A session's contents are fixed when it starts.
   */
  const [sessionCards] = useState<CardType[]>(() => {
    if (mode === 'review') {
      const eligible = new Set<string>()
      for (const [setKey, entries] of groupBySet(deck)) {
        const reviewable = new Set(
          progress.reviewableCardIds(
            setKey,
            entries.map((entry) => entry.cardId),
          ),
        )
        for (const entry of entries) {
          if (reviewable.has(entry.cardId)) eligible.add(entry.sessionId)
        }
      }
      // Review is already a filtered subset, so it is never capped — the whole point is
      // to see everything still outstanding.
      return deck.cards.filter((card) => eligible.has(card.id))
    }

    if (!deck.sessionLimit || deck.cards.length <= deck.sessionLimit) return deck.cards

    // Shuffle before slicing, or a capped deck would serve the same opening cards every
    // time. `createQuiz` shuffles too, but only what it is given.
    const seed = randomSeed()
    const picked = new Set(shuffle(deck.cards.map((card) => card.id), seed).slice(0, deck.sessionLimit))
    return deck.cards.filter((card) => picked.has(card.id))
  })

  const [initialMarked] = useState<string[]>(() => {
    const marked: string[] = []
    const inSession = new Set(sessionCards.map((card) => card.id))
    for (const [setKey, entries] of groupBySet(deck)) {
      const stored = progress.snapshot.sets[setKey]?.cards ?? {}
      for (const entry of entries) {
        if (inSession.has(entry.sessionId) && stored[entry.cardId]?.marked) {
          marked.push(entry.sessionId)
        }
      }
    }
    return marked
  })

  const reducer = useMemo(() => createQuizReducer(sessionCards), [sessionCards])
  const [quiz, dispatch] = useReducer(
    reducer,
    { setId: deck.id, mode, cards: sessionCards, marked: initialMarked },
    createQuiz,
  )

  const view = selectView(quiz, sessionCards)
  const finished = quiz.phase === 'finished'

  // Recording a completed session is a side effect, so it belongs in an effect rather
  // than in the render path. Deps are deliberately just `finished`: `progress` changes
  // identity on every answer, and including it would re-record the session repeatedly.
  useEffect(() => {
    if (!finished) return
    // A course session touches several sets; each gets its own "last studied" stamp.
    for (const setKey of deck.setKeys) progress.completeSession(setKey)
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentCard = view.card
  const currentSelection = view.selection
  const currentMarked = view.isMarked

  const handleSubmit = useCallback(() => {
    if (!currentCard) return
    dispatch({ type: 'submit' })
    // The reducer stays pure; persistence happens here, using the same grading
    // function the reducer uses so the two can never disagree.
    const answer = gradeCard(currentCard, currentSelection, Date.now())
    const origin = deck.originOf(currentCard.id)
    if (origin) progress.recordAnswer(origin.setKey, origin.cardId, answer.isCorrect)
  }, [currentCard, currentSelection, deck, progress])

  const handleToggleMark = useCallback(() => {
    if (!currentCard) return
    dispatch({ type: 'toggleMark' })
    const origin = deck.originOf(currentCard.id)
    if (origin) progress.setMarked(origin.setKey, origin.cardId, !currentMarked)
  }, [currentCard, currentMarked, deck, progress])

  const handleNext = useCallback(() => dispatch({ type: 'next' }), [])

  if (sessionCards.length === 0) {
    return (
      <EmptyState
        icon="target"
        level={1}
        title="Nothing to review yet"
        description="Review mode collects the cards you answered incorrectly plus anything you starred. Run a practice session first and they will show up here."
        action={
          <>
            <ButtonLink to={`${deck.quizPath}?mode=practice`}>Practice all cards</ButtonLink>
            <ButtonLink to={deck.backTo} variant="outline">
              Back to {deck.backLabel}
            </ButtonLink>
          </>
        }
      />
    )
  }

  if (finished) {
    return (
      <ResultsPanel
        deck={deck}
        mode={mode}
        total={sessionCards.length}
        stats={view.stats}
        missed={missedCardIds(quiz).length}
        marked={quiz.marked.length}
        onRestart={onRestart}
        footer={footer}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/*
        The visible page title would duplicate the back-link and the mode badge, but a
        page still needs an h1 to anchor its outline — the graded verdict below is an h2.
      */}
      <h1 className="sr-only">
        {deck.title} — {mode === 'review' ? 'review' : 'practice'} session
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={deck.backTo}
          className="flex min-h-[44px] items-center gap-1.5 font-body text-sm text-content-muted hover:text-brand"
        >
          <Icon name="arrow-left" size={16} />
          {deck.backLabel}
        </Link>
        {mode === 'review' ? <Badge tone="warning">Review mode</Badge> : <Badge tone="brand">Practice</Badge>}
        {/* A capped session says so, or the card count looks like the whole course. */}
        {mode !== 'review' && deck.sessionLimit && deck.cards.length > deck.sessionLimit ? (
          <Badge>
            {sessionCards.length} of {deck.cards.length}
          </Badge>
        ) : null}

        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => dispatch({ type: 'finish' })}>
          End session
        </Button>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4 font-body text-sm">
          <p className="text-content-muted">
            <span className="font-medium text-content-strong">
              {view.position} / {view.total}
            </span>{' '}
            questions
          </p>
          <p className="text-content-muted">
            {view.stats.answered > 0 ? (
              <>
                <span className="text-ok-text">{view.stats.correct} correct</span>
                {view.stats.incorrect > 0 ? (
                  <>
                    {' · '}
                    <span className="text-bad-text">{view.stats.incorrect} missed</span>
                  </>
                ) : null}
              </>
            ) : (
              'Not answered yet'
            )}
          </p>
        </div>
        <ProgressBar
          className="mt-2"
          value={view.stats.answered}
          max={view.total}
          label={`Question ${view.position} of ${view.total}`}
        />
      </div>

      {currentCard ? (
        <QuestionCard
          card={currentCard}
          selection={view.selection}
          answer={view.answer}
          isMarked={view.isMarked}
          isLast={view.position === view.total}
          onToggleOption={(optionId) => dispatch({ type: 'toggle', optionId })}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onToggleMark={handleToggleMark}
        />
      ) : null}
    </div>
  )
}

interface ResultsPanelProps {
  deck: Deck
  mode: QuizMode
  total: number
  stats: QuizStats
  missed: number
  marked: number
  onRestart: () => void
  footer?: React.ReactNode
}

function ResultsPanel({ deck, mode, total, stats, missed, marked, onRestart, footer }: ResultsPanelProps) {
  const skipped = total - stats.answered
  const strong = stats.accuracy >= 80

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="font-body text-xs uppercase tracking-widest text-brand">
          {mode === 'review' ? 'Review session' : 'Practice session'}
        </p>
        <h1 className="mt-2 font-heading text-5xl leading-none">
          {stats.answered === 0 ? 'Session ended' : strong ? 'Strong session' : 'Session complete'}
        </h1>
        <p className="mt-3 font-body text-lg text-content-muted">
          {deck.title} · {pluralize(total, 'card')} in this session
        </p>
      </header>

      <Card className="space-y-6">
        <div className="flex flex-wrap gap-8">
          <Stat
            label="Accuracy"
            value={stats.answered === 0 ? '—' : `${stats.accuracy}%`}
            tone={stats.answered === 0 ? 'default' : strong ? 'success' : 'error'}
          />
          <Stat label="Correct" value={stats.correct} tone="success" />
          <Stat label="Missed" value={stats.incorrect} tone={stats.incorrect > 0 ? 'error' : 'default'} />
          {skipped > 0 ? <Stat label="Not reached" value={skipped} /> : null}
        </div>

        <ProgressBar
          value={stats.correct}
          max={Math.max(stats.answered, 1)}
          label={`${stats.correct} of ${stats.answered} answered correctly`}
          tone={strong ? 'success' : 'brand'}
        />

        {missed > 0 || marked > 0 ? (
          <Alert tone="warning" title="Queued for review">
            {[missed > 0 && `${pluralize(missed, 'card')} missed`, marked > 0 && `${marked} starred`]
              .filter(Boolean)
              .join(' · ')}
            . Review mode will show exactly these.
          </Alert>
        ) : stats.answered > 0 ? (
          <Alert tone="success" title="Clean sweep">
            Nothing was missed or starred in this session.
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {missed > 0 || marked > 0 ? (
            <ButtonLink to={`${deck.quizPath}?mode=review`} size="lg">
              <Icon name="target" size={18} />
              Review what you missed
            </ButtonLink>
          ) : null}

          <Button variant={missed > 0 || marked > 0 ? 'outline' : 'primary'} size="lg" onClick={onRestart}>
            <Icon name="rotate" size={18} />
            Run it again
          </Button>

          <ButtonLink to={deck.backTo} variant="ghost" size="lg">
            Back to {deck.backLabel}
          </ButtonLink>
        </div>
      </Card>

      {footer}
    </div>
  )
}
