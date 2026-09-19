import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/cn'
import { Icon } from './Icon'
import type { IconName } from './Icon'

/**
 * Card, Badge and Alert — the container primitives from the style guide §7, built on
 * the mode-aware tokens so light and dark are one implementation.
 */

type CardTone = 'surface' | 'parchment'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `parchment` is the warm accent surface; it becomes a dark warm tone in dark mode. */
  tone?: CardTone
  /** Adds the hover elevation used on clickable cards. */
  interactive?: boolean
}

export function Card({ tone = 'surface', interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-6 shadow-sm transition-shadow duration-150',
        tone === 'surface' ? 'border-line bg-surface' : 'border-accent-border bg-accent',
        // Dark mode gets no shadow lift (§9) — the border brightens instead.
        interactive && 'hover:shadow-md dark:hover:border-line-strong dark:hover:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'error' | 'warning'

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-content-muted',
  brand: 'bg-brand-fill text-brand',
  success: 'bg-ok-fill text-ok-text',
  error: 'bg-bad-fill text-bad-text',
  warning: 'bg-warn-fill text-warn-text',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        // §3: uppercase tracking is reserved for very small labels like this.
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-xs uppercase tracking-widest',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export type AlertTone = 'info' | 'success' | 'error' | 'warning'

const ALERT_TONES: Record<AlertTone, { wrapper: string; icon: IconName; label: string }> = {
  info: { wrapper: 'border-brand/30 bg-brand-fill text-brand', icon: 'info', label: 'Note' },
  success: { wrapper: 'border-ok/30 bg-ok-fill text-ok-text', icon: 'check', label: 'Correct' },
  error: { wrapper: 'border-bad/30 bg-bad-fill text-bad-text', icon: 'x', label: 'Incorrect' },
  warning: { wrapper: 'border-warn/30 bg-warn-fill text-warn-text', icon: 'alert', label: 'Warning' },
}

interface AlertProps {
  tone?: AlertTone
  title?: string
  children?: ReactNode
  className?: string
}

/**
 * Semantic colour is always paired with an icon and a text label — §8 forbids relying
 * on colour alone to convey meaning.
 */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const config = ALERT_TONES[tone]

  return (
    <div className={cn('flex gap-3 rounded-lg border p-4', config.wrapper, className)}>
      <Icon name={config.icon} size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm font-medium">{title ?? config.label}</p>
        {children ? <div className="mt-1 font-body text-sm text-content">{children}</div> : null}
      </div>
    </div>
  )
}
