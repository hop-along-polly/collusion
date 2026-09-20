import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface ProgressBarProps {
  value: number
  max: number
  /** Accessible name, e.g. "Question 12 of 47". */
  label: string
  className?: string
  tone?: 'brand' | 'success'
}

export function ProgressBar({ value, max, label, className, tone = 'brand' }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.round((Math.min(value, max) / max) * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', tone === 'brand' ? 'bg-brand' : 'bg-ok')}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

/** Loading state. Announced politely so a screen reader knows work is in flight. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-content-muted">
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand"
      />
      <span className="font-body text-sm">{label}</span>
    </div>
  )
}

interface EmptyStateProps {
  icon?: IconName
  title: string
  description: ReactNode
  /** Every empty state offers a way forward — no dead ends. */
  action?: ReactNode
  /**
   * Heading level, so the document outline stays semantic (§8). Use `1` when the empty
   * state *is* the page's content, `2` when it sits under an existing page title.
   */
  level?: 1 | 2
  className?: string
}

export function EmptyState({
  icon = 'book',
  title,
  description,
  action,
  level = 2,
  className,
}: EmptyStateProps) {
  const Heading = level === 1 ? 'h1' : 'h2'

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-fill text-brand">
        <Icon name={icon} size={24} />
      </span>
      <Heading className="font-heading text-3xl">{title}</Heading>
      <div className="mt-2 max-w-prose font-body text-sm text-content-muted">{description}</div>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  )
}

interface StatProps {
  label: string
  value: ReactNode
  tone?: 'default' | 'success' | 'error' | 'brand'
  className?: string
}

const STAT_TONES: Record<NonNullable<StatProps['tone']>, string> = {
  default: 'text-content-strong',
  success: 'text-ok-text',
  error: 'text-bad-text',
  brand: 'text-brand',
}

/** A small labelled figure. Used in the quiz header and on the results screen. */
export function Stat({ label, value, tone = 'default', className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="font-body text-xs uppercase tracking-widest text-content-muted">{label}</span>
      <span className={cn('font-heading text-3xl leading-none', STAT_TONES[tone])}>{value}</span>
    </div>
  )
}
