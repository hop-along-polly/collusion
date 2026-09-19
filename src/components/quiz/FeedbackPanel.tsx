import { useEffect, useRef } from 'react'

import type { Card } from '@/types/cards'
import type { GradedAnswer } from '@/types/quiz'
import { cn } from '@/utils/cn'
import { Icon } from '../ui/Icon'
import { RichText } from '../ui/RichText'
import { CitationList } from './CitationList'

interface FeedbackPanelProps {
  card: Card
  answer: GradedAnswer
}

/**
 * Shown the moment a card is graded: verdict, explanation, citations.
 *
 * Focus moves here on reveal rather than staying on the Submit button, so a keyboard
 * or screen-reader user lands on the result instead of having to hunt for it. Because
 * focus moves, there is no `aria-live` region — that would announce the same content
 * twice.
 */
export function FeedbackPanel({ card, answer }: FeedbackPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [answer.cardId])

  const partial = !answer.isCorrect && answer.falsePositives.length === 0 && answer.missed.length > 0

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={cn(
        'mt-6 rounded-lg border p-5 focus:outline-none',
        answer.isCorrect ? 'border-ok/40 bg-ok-fill' : 'border-bad/40 bg-bad-fill',
      )}
    >
      <h2 className={cn('flex items-center gap-2 font-heading text-2xl', answer.isCorrect ? 'text-ok-text' : 'text-bad-text')}>
        <Icon name={answer.isCorrect ? 'check' : 'x'} size={22} className="shrink-0" />
        {answer.isCorrect ? 'Correct' : partial ? 'Not quite — you missed one' : 'Not quite'}
      </h2>

      {!answer.isCorrect ? (
        <p className="mt-1 font-body text-sm text-content-muted">
          {[
            answer.missed.length > 0 &&
              `${answer.missed.length} correct ${answer.missed.length === 1 ? 'option' : 'options'} not selected`,
            answer.falsePositives.length > 0 &&
              `${answer.falsePositives.length} incorrect ${answer.falsePositives.length === 1 ? 'option' : 'options'} selected`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : null}

      <div className="mt-4">
        <RichText className="text-sm leading-relaxed">{card.explanation}</RichText>
      </div>

      <CitationList citations={card.citations} />
    </div>
  )
}
