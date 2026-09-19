import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { QuestionCard } from '@/components/quiz/QuestionCard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { EmptyState, Loading, ProgressBar, Stat } from '@/components/ui/Feedback'
import { Icon } from '@/components/ui/Icon'
import { Alert, Badge, Card } from '@/components/ui/Surface'
import { findDomain, findSet } from '@/data/catalog'
import { gradeCard } from '@/engine/grade'
import { createQuiz, createQuizReducer, missedCardIds, selectView } from '@/engine/quiz'
import { useCardSet } from '@/hooks/useCardSet'
import { useProgress } from '@/hooks/useProgress'
import type { Card as CardType, CardSet, CardSetMeta, DomainMeta } from '@/types/cards'
import type { QuizMode, QuizStats } from '@/types/quiz'
import { pluralize } from '@/utils/format'
import { NotFoundPage } from './NotFoundPage'

function parseMode(value: string | null): QuizMode {
  return value === 'review' ? 'review' : 'practice'
}

export function QuizPage() {
  const { domainId, setId } = useParams<{ domainId: string; setId: string }>()
  const [searchParams] = useSearchParams()
  const mode = parseMode(searchParams.get('mode'))

  /**
   * Bumping this remounts the session, which is how "run it again" works: a quiz is
   * created once per mount, so a fresh mount is a fresh shuffle with a clean slate.
   */
  const [attempt, setAttempt] = useState(0)

  const domain = domainId ? findDomain(domainId) : undefined
  const meta = domainId && setId ? findSet(domainId, setId) : undefined
  const state = useCardSet(meta)

  if (!domain || !meta) return <NotFoundPage />

  if (state.status === 'loading') return <Loading label={`Loading ${meta.title}…`} />

  if (state.status === 'error') {
    return (
      <EmptyState
        icon="alert"
        level={1}
        title="This card set could not be loaded"
        description={state.error.message}
        action={
          <ButtonLink to={`/${domain.id}`} variant="outline">
            <Icon name="arrow-left" size={16} />
            Back to {domain.title}
          </ButtonLink>
        }
      />
    )
  }

  return (
    <QuizSession
      key={`${meta.path}:${mode}:${attempt}`}
      domain={domain}
      meta={meta}
      set={state.data}
      mode={mode}
      onRestart={() => setAttempt((value) => value + 1)}
    />
  )
}

interface QuizSessionProps {
  domain: DomainMeta
  meta: CardSetMeta
  set: CardSet
  mode: QuizMode
  onRestart: () => void
}

function QuizSession({ domain, meta, set, mode, onRestart }: QuizSessionProps) {
  const progress = useProgress()
  const setKey = meta.path

  /**
   * The card list and the starting marks are captured once, at mount.
   *
   * `useState`'s lazy initialiser is doing real work here: reading them through
   * `useMemo` would recompute as answers land (the snapshot changes on every submit),
   * and cards would disappear from a review session the moment they were answered
   * correctly. A session's contents are fixed when it starts.
   */
  const [sessionCards] = useState<CardType[]>(() => {
    if (mode !== 'review') return set.cards
    const eligible = new Set(
      progress.reviewableCardIds(
        setKey,
        set.cards.map((card) => card.id),
      ),
    )
    return set.cards.filter((card) => eligible.has(card.id))
  })

  const [initialMarked] = useState<string[]>(() => {
    const stored = progress.snapshot.sets[setKey]?.cards ?? {}
    return sessionCards.filter((card) => stored[card.id]?.marked).map((card) => card.id)
  })

  const reducer = useMemo(() => createQuizReducer(sessionCards), [sessionCards])
  const [quiz, dispatch] = useReducer(
    reducer,
    { setId: setKey, mode, cards: sessionCards, marked: initialMarked },
    createQuiz,
  )

  const view = selectView(quiz, sessionCards)
  const finished = quiz.phase === 'finished'

  // Recording a completed session is a side effect, so it belongs in an effect rather
  // than in the render path. Deps are deliberately just `finished`: `progress` changes
  // identity on every answer, and including it would re-record the session repeatedly.
  useEffect(() => {
    if (!finished) return
    progress.completeSession(setKey)
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
    progress.recordAnswer(setKey, currentCard.id, answer.isCorrect)
  }, [currentCard, currentSelection, progress, setKey])

  const handleToggleMark = useCallback(() => {
    if (!currentCard) return
    dispatch({ type: 'toggleMark' })
    progress.setMarked(setKey, currentCard.id, !currentMarked)
  }, [currentCard, currentMarked, progress, setKey])

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
            <ButtonLink to={`/${domain.id}/${meta.id}/quiz?mode=practice`}>Practice all cards</ButtonLink>
            <ButtonLink to={`/${domain.id}/${meta.id}`} variant="outline">
              Back to {meta.title}
            </ButtonLink>
          </>
        }
      />
    )
  }

  if (finished) {
    return (
      <ResultsPanel
        domain={domain}
        meta={meta}
        mode={mode}
        total={sessionCards.length}
        stats={view.stats}
        missed={missedCardIds(quiz).length}
        marked={quiz.marked.length}
        onRestart={onRestart}
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
        {meta.title} — {mode === 'review' ? 'review' : 'practice'} session
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`/${domain.id}/${meta.id}`}
          className="flex min-h-[44px] items-center gap-1.5 font-body text-sm text-content-muted hover:text-brand"
        >
          <Icon name="arrow-left" size={16} />
          {meta.title}
        </Link>
        {mode === 'review' ? <Badge tone="warning">Review mode</Badge> : <Badge tone="brand">Practice</Badge>}

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
  domain: DomainMeta
  meta: CardSetMeta
  mode: QuizMode
  total: number
  stats: QuizStats
  missed: number
  marked: number
  onRestart: () => void
}

function ResultsPanel({ domain, meta, mode, total, stats, missed, marked, onRestart }: ResultsPanelProps) {
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
          {meta.title} · {pluralize(total, 'card')} in this session
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
            <ButtonLink to={`/${domain.id}/${meta.id}/quiz?mode=review`} size="lg">
              <Icon name="target" size={18} />
              Review what you missed
            </ButtonLink>
          ) : null}

          <Button variant={missed > 0 || marked > 0 ? 'outline' : 'primary'} size="lg" onClick={onRestart}>
            <Icon name="rotate" size={18} />
            Run it again
          </Button>

          <ButtonLink to={`/${domain.id}/${meta.id}`} variant="ghost" size="lg">
            Back to {meta.title}
          </ButtonLink>
        </div>
      </Card>

      <p className="font-body text-sm text-content-subtle">
        Looking for something else?{' '}
        <Link to={`/${domain.id}`} className="text-brand underline-offset-2 hover:underline">
          Other {domain.title} sets
        </Link>{' '}
        ·{' '}
        <Link to="/" className="text-brand underline-offset-2 hover:underline">
          All domains
        </Link>
      </p>
    </div>
  )
}
