import { onScopeDispose, readonly, ref, type Ref } from 'vue'

import { STEP_MS, prefersReducedMotion } from './motion'

export interface Stepped {
  /** Where the count is right now. */
  readonly count: Readonly<Ref<number>>
  /** Sends the count to `target`: one step at once, and then one more every `STEP_MS`. */
  stepTo(target: number): void
}

/**
 * A count that gets to where it is sent one step at a time, so that what it
 * counts comes, or goes, one after another. Sent somewhere else on the way,
 * it turns round from where it is. It gets there in a single step when the
 * visitor prefers reduced motion.
 */
export function useStepped(start: number): Stepped {
  const count = ref(start)
  let timer: ReturnType<typeof setTimeout> | undefined

  function stepTo(target: number): void {
    clearTimeout(timer)
    if (count.value === target) return

    if (prefersReducedMotion()) {
      count.value = target
      return
    }

    count.value += Math.sign(target - count.value)
    if (count.value !== target) timer = setTimeout(() => stepTo(target), STEP_MS)
  }

  onScopeDispose(() => clearTimeout(timer))

  return { count: readonly(count), stepTo }
}
