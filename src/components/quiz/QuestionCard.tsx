import { canSubmit } from '@/engine/grade'
import type { Card as CardType } from '@/types/cards'
import type { GradedAnswer, Selection } from '@/types/quiz'
import { cardTypeLabel } from '@/utils/format'
import { cn } from '@/utils/cn'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { Badge, Card } from '../ui/Surface'
import { RichText } from '../ui/RichText'
import { FeedbackPanel } from './FeedbackPanel'
import { OptionList } from './OptionList'

interface QuestionCardProps {
  card: CardType
  selection: Selection
  answer: GradedAnswer | null
  isMarked: boolean
  isLast: boolean
  onToggleOption: (optionId: string) => void
  onSubmit: () => void
  onNext: () => void
  onToggleMark: () => void
}

export function QuestionCard({
  card,
  selection,
  answer,
  isMarked,
  isLast,
  onToggleOption,
  onSubmit,
  onNext,
  onToggleMark,
}: QuestionCardProps) {
  const revealed = answer !== null
  const submittable = canSubmit(card, selection)
  const promptId = `prompt-${card.id}`

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{cardTypeLabel(card.type)}</Badge>
        {card.tags?.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}

        <button
          type="button"
          onClick={onToggleMark}
          aria-pressed={isMarked}
          className={cn(
            'ml-auto flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 font-body text-sm transition-colors',
            isMarked ? 'bg-warn-fill text-warn-text' : 'text-content-muted hover:bg-surface-2 hover:text-content',
          )}
        >
          <Icon name="star" size={16} filled={isMarked} />
          {isMarked ? 'Marked for review' : 'Mark for review'}
        </button>
      </div>

      {/*
        `role="group"` + `aria-labelledby` rather than fieldset/legend: the prompt can
        contain a fenced code block (see the CODEOWNERS card), and a `<pre>` is not
        valid inside a `<legend>`. This gives identical semantics — the question is
        announced as the group's name, so the options are never an unlabelled list —
        without constraining what a prompt may contain.
      */}
      <div role="group" aria-labelledby={promptId} className="mt-4">
        <div id={promptId}>
          <RichText className="font-heading text-2xl leading-snug text-content-strong sm:text-3xl">
            {card.prompt}
          </RichText>
        </div>

        <OptionList card={card} selection={selection} revealed={revealed} onToggle={onToggleOption} />
      </div>

      {revealed ? <FeedbackPanel card={card} answer={answer} /> : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {revealed ? (
          <Button onClick={onNext} size="lg">
            {isLast ? 'See results' : 'Next question'}
            <Icon name="arrow-right" size={18} />
          </Button>
        ) : (
          <Button onClick={onSubmit} size="lg" disabled={!submittable}>
            Submit answer
          </Button>
        )}

        {!revealed && !submittable ? (
          <p className="font-body text-sm text-content-muted">
            {card.type === 'multi' ? 'Select one or more options.' : 'Select an option.'}
          </p>
        ) : null}
      </div>
    </Card>
  )
}
