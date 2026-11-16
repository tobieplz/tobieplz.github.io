import { onScopeDispose, ref, type Ref } from 'vue'

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/+=?'
const FLASH_MS = 130
const CHURN_INTERVAL_MS = 70
const RESOLVE_BASE_MS = 320
const RESOLVE_PER_CHARACTER_MS = 22

export interface Scramble {
  /** What to show while an effect is running, or null when there is none. */
  readonly frame: Readonly<Ref<string | null>>
  /** Noise in the shape of `shape`, for a moment. */
  flash(shape: string): void
  /** Noise in the shape of `shape`, until stopped. */
  churn(shape: string): void
  /** Noise that settles into `target` from left to right, starting after `delay` ms. */
  resolve(target: string, delay: number): void
  stop(): void
}

/**
 * Text effects for the redacted cells. Every effect is skipped when the
 * visitor prefers reduced motion, which leaves `frame` at null and the cell
 * showing its real content.
 */
export function useScramble(): Scramble {
  const frame = ref<string | null>(null)
  let animation = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function stop(): void {
    if (animation) cancelAnimationFrame(animation)
    clearTimeout(timer)
    animation = 0
    frame.value = null
  }

  function flash(shape: string): void {
    stop()
    if (prefersReducedMotion()) return
    frame.value = noise(shape)
    timer = setTimeout(stop, FLASH_MS)
  }

  function churn(shape: string): void {
    stop()
    if (prefersReducedMotion()) return
    const step = () => {
      frame.value = noise(shape)
      timer = setTimeout(step, CHURN_INTERVAL_MS)
    }
    step()
  }

  function resolve(target: string, delay: number): void {
    stop()
    if (prefersReducedMotion()) return

    const startsAt = performance.now() + delay
    const duration = RESOLVE_BASE_MS + target.length * RESOLVE_PER_CHARACTER_MS
    frame.value = noise(target)

    const step = (now: number) => {
      const progress = (now - startsAt) / duration
      if (progress >= 1) {
        stop()
        return
      }
      const settled = Math.max(0, Math.floor(progress * target.length))
      frame.value = target.slice(0, settled) + noise(target.slice(settled))
      animation = requestAnimationFrame(step)
    }
    animation = requestAnimationFrame(step)
  }

  onScopeDispose(stop)

  return { frame, flash, churn, resolve, stop }
}

/** Random glyphs with the spaces of `shape` kept, so the word lengths stay recognisable. */
function noise(shape: string): string {
  return shape.replace(/\S/g, () => GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)))
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
