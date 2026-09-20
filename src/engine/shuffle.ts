/**
 * Deterministic shuffling.
 *
 * A seeded PRNG rather than `Math.random` so a session's card order is reproducible:
 * it makes the engine unit-testable, and leaves room for a future "resume this
 * session" feature that only needs to persist the seed.
 */

/** mulberry32 — small, fast, good enough for ordering questions. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates. Returns a new array; the input is untouched. */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const random = createRandom(seed)
  const result = [...items]

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]
    const b = result[j]
    // Guarded for `noUncheckedIndexedAccess`; both indices are always in range.
    if (a !== undefined && b !== undefined) {
      result[i] = b
      result[j] = a
    }
  }

  return result
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}
