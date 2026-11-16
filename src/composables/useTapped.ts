import { onMounted, onUnmounted } from 'vue'

import { FLASH_MS } from './motion'

/** What answers a tap: a link, a button, or a row that opens. */
const TAPPABLE = 'a, button, .index__row--action'

/**
 * Marks what has just been tapped with `data-tapped`, for a moment. On a
 * screen with no pointer the stylesheet turns the mark into paper and ink
 * trading places, where a phone would otherwise flash a grey box of its own.
 *
 * It listens for clicks, not touches: a finger that lands on a row to scroll
 * the page never gets as far as a click, so nothing flashes under it.
 */
export function useTapped(): void {
  let tapped: Element | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  function release(): void {
    clearTimeout(timer)
    tapped?.removeAttribute('data-tapped')
    tapped = null
  }

  function mark({ target }: MouseEvent): void {
    release()
    if (!(target instanceof Element)) return

    tapped = target.closest(TAPPABLE)
    if (!tapped) return

    tapped.setAttribute('data-tapped', '')
    timer = setTimeout(release, FLASH_MS)
  }

  onMounted(() => document.addEventListener('click', mark))
  onUnmounted(() => {
    document.removeEventListener('click', mark)
    release()
  })
}
