/**
 * What opens and closes on the page does it in hard steps, not in a glide.
 * This is the time from one step to the next: a row of a list, or a couple of
 * lines of text.
 */
export const STEP_MS = 35

/** Whether the visitor has asked their system for less motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
