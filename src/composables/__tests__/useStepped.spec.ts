import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { STEP_MS } from '../motion'
import { useStepped, type Stepped } from '../useStepped'

/** jsdom has no matchMedia, so the visitor's wish for less motion is answered here. */
function preferReducedMotion(reduce: boolean): void {
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: reduce } as MediaQueryList)
}

/** The count in a scope of its own, the way a component would hold it. */
function stepped(start: number): Stepped & { dispose(): void } {
  const scope = effectScope()
  const count = scope.run(() => useStepped(start))
  if (!count) throw new Error('the scope did not run')
  return { ...count, dispose: () => scope.stop() }
}

describe('useStepped', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    preferReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('takes the first step at once, and then one more every step of the clock', () => {
    const { count, stepTo } = stepped(3)

    stepTo(6)
    expect(count.value).toBe(4)

    vi.advanceTimersByTime(STEP_MS - 1)
    expect(count.value).toBe(4)

    vi.advanceTimersByTime(1)
    expect(count.value).toBe(5)

    vi.advanceTimersByTime(STEP_MS)
    expect(count.value).toBe(6)
  })

  it('stops when it is there', () => {
    const { count, stepTo } = stepped(3)

    stepTo(5)
    vi.advanceTimersByTime(STEP_MS)

    expect(count.value).toBe(5)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('steps down the same way', () => {
    const { count, stepTo } = stepped(6)

    stepTo(4)
    expect(count.value).toBe(5)

    vi.advanceTimersByTime(STEP_MS)
    expect(count.value).toBe(4)
  })

  it('turns round from where it is when it is sent somewhere else on the way', () => {
    const { count, stepTo } = stepped(3)
    stepTo(9)
    vi.advanceTimersByTime(STEP_MS)
    expect(count.value).toBe(5)

    stepTo(3)
    expect(count.value).toBe(4)

    vi.advanceTimersByTime(STEP_MS)
    expect(count.value).toBe(3)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does nothing when it is sent to where it already is', () => {
    const { count, stepTo } = stepped(3)

    stepTo(3)

    expect(count.value).toBe(3)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gets there in one step when the visitor prefers reduced motion', () => {
    preferReducedMotion(true)
    const { count, stepTo } = stepped(3)

    stepTo(13)

    expect(count.value).toBe(13)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stops where it is when whatever holds it goes away', () => {
    const { count, stepTo, dispose } = stepped(3)
    stepTo(9)

    dispose()
    vi.advanceTimersByTime(1000)

    expect(count.value).toBe(4)
  })
})
