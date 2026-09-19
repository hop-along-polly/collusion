import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'

import { cn } from '@/utils/cn'

/**
 * Button variants from the style guide §9 table. Light mode darkens on hover; dark
 * mode lightens — both are handled by the `--brand-hover` token flipping, so no
 * `dark:` classes are needed here.
 */
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-body tracking-wide ' +
  'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ' +
  // §8 requires a 44px minimum tap target. Every size carries it as real height rather
  // than as an overflowing pseudo-element, so a button never swallows a neighbour's taps.
  'min-h-[44px]'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-hover active:bg-brand-active',
  outline: 'border border-line-strong text-brand hover:bg-brand-fill',
  ghost: 'text-content hover:bg-surface-2',
  destructive: 'bg-bad text-white hover:opacity-90',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 text-sm',
  md: 'px-5 text-sm',
  lg: 'px-6 text-base',
}

function classesFor(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return <button ref={ref} type={type} className={classesFor(variant, size, className)} {...props} />
})

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** A router link that looks like a button — used for navigation, never for actions. */
export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={classesFor(variant, size, className)} {...props} />
}
