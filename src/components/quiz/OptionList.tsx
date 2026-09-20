import { verdictFor } from '@/engine/grade'
import type { OptionVerdict } from '@/engine/grade'
import type { Card as CardType } from '@/types/cards'
import type { Selection } from '@/types/quiz'
import { cn } from '@/utils/cn'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/Icon'
import { RichText } from '../ui/RichText'

/**
 * Options are real radio/checkbox inputs, visually hidden but focusable. That buys
 * native keyboard behaviour for free — arrow keys move within a radio group, space
 * toggles a checkbox — and screen readers announce the correct role and checked state
 * without any ARIA of our own.
 */

const VERDICT_STYLES: Record<OptionVerdict, string> = {
  hit: 'border-ok bg-ok-fill',
  missed: 'border-ok border-dashed bg-ok-fill',
  'false-positive': 'border-bad bg-bad-fill',
  neutral: 'border-line bg-surface',
}

const VERDICT_MARKS: Record<OptionVerdict, { icon: IconName; className: string; label: string } | null> = {
  hit: { icon: 'check', className: 'text-ok', label: 'Correct, and you selected it' },
  missed: { icon: 'check', className: 'text-ok', label: 'Correct, but you missed it' },
  'false-positive': { icon: 'x', className: 'text-bad', label: 'Incorrect, and you selected it' },
  neutral: null,
}

interface OptionListProps {
  card: CardType
  selection: Selection
  revealed: boolean
  onToggle: (optionId: string) => void
}

export function OptionList({ card, selection, revealed, onToggle }: OptionListProps) {
  const inputType = card.type === 'multi' ? 'checkbox' : 'radio'

  return (
    <ul className="mt-6 space-y-3">
      {card.options.map((option) => {
        const checked = selection.includes(option.id)
        const verdict = revealed ? verdictFor(card, option.id, selection) : 'neutral'
        const mark = revealed ? VERDICT_MARKS[verdict] : null

        return (
          <li key={option.id}>
            <label
              className={cn(
                'group flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
                revealed
                  ? cn('cursor-default', VERDICT_STYLES[verdict])
                  : checked
                    ? 'border-brand bg-brand-fill'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2',
                // The ring lands on the visual box because the real input is sr-only.
                'has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2',
              )}
            >
              <input
                type={inputType}
                name={`card-${card.id}`}
                value={option.id}
                checked={checked}
                disabled={revealed}
                onChange={() => onToggle(option.id)}
                className="sr-only"
              />

              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors',
                  inputType === 'checkbox' ? 'rounded-sm' : 'rounded-full',
                  checked ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface',
                  revealed && verdict === 'hit' && 'border-ok bg-ok text-white',
                  revealed && verdict === 'false-positive' && 'border-bad bg-bad text-white',
                )}
              >
                {checked ? <Icon name="check" size={14} /> : null}
              </span>

              <span className="min-w-0 flex-1">
                <RichText inline className="font-body text-content-strong">
                  {option.text}
                </RichText>

                {revealed && mark ? (
                  <span className={cn('mt-2 flex items-start gap-1.5 font-body text-sm', mark.className)}>
                    <Icon name={mark.icon} size={16} className="mt-0.5 shrink-0" />
                    <span className="sr-only">{mark.label}. </span>
                    {option.rationale ? (
                      <RichText inline className="text-content-muted">
                        {option.rationale}
                      </RichText>
                    ) : (
                      <span className="text-content-muted">{mark.label}</span>
                    )}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
