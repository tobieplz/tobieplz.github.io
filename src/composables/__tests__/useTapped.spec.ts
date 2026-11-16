import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { FLASH_MS } from '../motion'
import { useTapped } from '../useTapped'

/** A page with one of each kind of thing that answers a tap, and some text that does not. */
const Page = defineComponent({
  setup() {
    useTapped()

    return () =>
      h('main', [
        h('div', { class: 'index__row index__row--action' }, [
          h('span', { class: 'project' }, 'A project'),
          h('button', { class: 'toggle', type: 'button' }),
        ]),
        h('a', { href: '#somewhere' }, [h('span', { class: 'words' }, 'A link')]),
        h('p', { class: 'plain' }, 'Just text'),
      ])
  },
})

describe('useTapped', () => {
  let page: ReturnType<typeof mount<typeof Page>>
  /** The elements that carry the mark right now, by tag name and class. */
  const marked = () =>
    [...document.querySelectorAll('[data-tapped]')].map((element) =>
      [element.tagName.toLowerCase(), ...element.classList].join('.'),
    )

  beforeEach(() => {
    vi.useFakeTimers()
    // Attached, so that a click travels up to the document the way a real one does.
    page = mount(Page, { attachTo: document.body })
  })

  afterEach(() => {
    page.unmount()
    vi.useRealTimers()
  })

  it('marks the row that was tapped', async () => {
    await page.get('.project').trigger('click')

    expect(marked()).toEqual(['div.index__row.index__row--action'])
  })

  it('marks a button in a row, not the row around it', async () => {
    await page.get('.toggle').trigger('click')

    expect(marked()).toEqual(['button.toggle'])
  })

  it('marks a link when what is in it was tapped', async () => {
    await page.get('.words').trigger('click')

    expect(marked()).toEqual(['a'])
  })

  it('marks nothing when the tap was on something that does not answer one', async () => {
    await page.get('.plain').trigger('click')

    expect(marked()).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('takes the mark away again after a moment', async () => {
    await page.get('.project').trigger('click')

    vi.advanceTimersByTime(FLASH_MS - 1)
    expect(marked()).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(marked()).toEqual([])
  })

  it('moves the mark to the next thing that is tapped', async () => {
    await page.get('.project').trigger('click')
    vi.advanceTimersByTime(FLASH_MS - 1)

    await page.get('.words').trigger('click')
    expect(marked()).toEqual(['a'])

    // The moment starts again with the second tap.
    vi.advanceTimersByTime(FLASH_MS - 1)
    expect(marked()).toEqual(['a'])
  })

  it('leaves nothing behind when the page goes away', async () => {
    const row = page.get('.index__row--action').element
    await page.get('.project').trigger('click')

    page.unmount()

    expect(row.hasAttribute('data-tapped')).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
