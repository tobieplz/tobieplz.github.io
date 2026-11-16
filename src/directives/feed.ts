import type { Directive } from 'vue'

import { STEP_MS, prefersReducedMotion } from '@/composables/motion'

/** About as tall as a row of an index, so that text comes out at the pace the rows of a list do. */
const LINES_PER_STEP = 2

/**
 * `v-feed="open"`, on a block of paragraphs that opens and closes. When `open`
 * changes, the text comes out a couple of lines at a time, or goes back in
 * the same way. No line is ever cut in half.
 *
 * The directive only moves the block from one state to the other. What the
 * two are is for the stylesheet to say: its own height when open, no height
 * and out of sight when closed, but still laid out, so that its lines can be
 * measured. Nothing moves when the visitor prefers reduced motion.
 */
export const vFeed: Directive<HTMLElement, boolean> = {
  updated(block, { value: open, oldValue: wasOpen }) {
    if (open !== wasOpen) feed(block, open)
  },
}

function feed(block: HTMLElement, open: boolean): void {
  for (const running of block.getAnimations()) running.cancel()
  if (prefersReducedMotion()) return

  // Out through every stop to the full height, or back through them to nothing.
  const heights = stops(block)
  const path = open ? heights : [...heights.slice(0, -1).reverse(), 0]
  if (path.length < 2) return

  // Each height is held until the next one is due, so the first step is taken at once.
  block.animate(
    path.map((height) => ({ height: `${height}px`, visibility: 'visible', easing: 'step-end' })),
    { duration: (path.length - 1) * STEP_MS },
  )
}

/**
 * The heights a block stops at on its way open: under every second line of
 * its text, and at its full height. The last line comes with whatever space
 * there is under it.
 */
function stops(block: HTMLElement): number[] {
  const { top } = block.getBoundingClientRect()
  const lineHeight = parseFloat(getComputedStyle(block).lineHeight)
  const lines: number[] = []

  for (const paragraph of block.children) {
    const box = paragraph.getBoundingClientRect()
    const style = getComputedStyle(paragraph)
    const above = parseFloat(style.paddingTop)
    const count = Math.round((box.height - above - parseFloat(style.paddingBottom)) / lineHeight)

    for (let line = 1; line <= count; line++) lines.push(box.top - top + above + line * lineHeight)
  }

  const full = (block.lastElementChild?.getBoundingClientRect().bottom ?? top) - top
  const pauses = lines
    .slice(0, -1)
    .filter((_, index) => index % LINES_PER_STEP === LINES_PER_STEP - 1)

  return [...pauses, full]
}
