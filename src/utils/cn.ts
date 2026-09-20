/**
 * Minimal class-name joiner. No `clsx` dependency — the app never needs conflict
 * resolution, only "drop the falsy bits and join".
 */
export type ClassValue = string | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
