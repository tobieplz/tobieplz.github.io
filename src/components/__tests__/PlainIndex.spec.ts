import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { STEP_MS } from '@/composables/motion'
import PlainIndex from '../PlainIndex.vue'
import type { PlainColumns, PlainRow } from '../types'

const columns: PlainColumns = { no: 'No.', when: 'Years', who: 'Employer', what: 'Role' }
const rows: PlainRow[] = [
  { no: '01', when: '2023–now', who: ['Some Company'], what: 'Developer' },
  { no: '02', when: '', who: ['Another Company'], what: 'Designer' },
  { no: '03', when: '2019', who: ['A Third Company'], what: 'Developer' },
]
/** Three more rows than a list that folds shows while it is closed. */
const manyRows: PlainRow[] = [
  ...rows,
  { no: '04', when: '2017', who: ['A Fourth Company'], what: 'Developer' },
  { no: '05', when: '2015', who: ['A Fifth Company'], what: 'Developer' },
  { no: '06', when: '2013', who: ['A Sixth Company'], what: 'Intern' },
]
const more = (count: number) => `${count} more employers`

// jsdom lays nothing out, so it cannot scroll either.
const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined)

/** jsdom has no matchMedia, so the visitor's wish for less motion is answered here. */
function preferReducedMotion(reduce: boolean): void {
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: reduce } as MediaQueryList)
}

beforeEach(() => {
  scrollBy.mockClear()
  preferReducedMotion(false)
})

/** Makes the button report these distances from the top of the screen, one per measurement. */
function placeButton(button: Element, ...tops: number[]): void {
  const measure = vi.fn<Element['getBoundingClientRect']>()
  for (const top of tops) measure.mockReturnValueOnce({ top, bottom: top + 32 } as DOMRect)
  button.getBoundingClientRect = measure
}

describe('PlainIndex', () => {
  it('shows the column headings in a row that screen readers skip', () => {
    const head = mount(PlainIndex, { props: { columns, rows } }).get('.index__head')

    expect(head.attributes('aria-hidden')).toBe('true')
    expect(head.findAll('span').map((cell) => cell.text())).toEqual([
      'No.',
      'Years',
      'Employer',
      'Role',
    ])
  })

  it('gives each cell its heading for screen readers instead', () => {
    const [row] = mount(PlainIndex, { props: { columns, rows } }).findAll('.index__list > li')

    expect(row?.get('.index__when').text()).toBe('Years: 2023–now')
    expect(row?.get('.index__what').text()).toBe('Role: Developer')
    expect(row?.findAll('.visually-hidden').map((label) => label.text())).toEqual([
      'Years:',
      'Role:',
    ])
  })

  it('does not announce a heading for an empty cell', () => {
    const row = mount(PlainIndex, { props: { columns, rows } }).findAll('.index__list > li')[1]

    expect(row?.get('.index__when').text()).toBe('')
  })

  it('lets the name start earlier, in the headings too, when there is no second column', () => {
    const wrapper = mount(PlainIndex, {
      props: {
        columns: { no: 'No.', who: 'Principle', what: 'In practice' },
        rows: [{ no: '01', who: ['Keep it simple'], what: 'Fewer parts.' }],
      },
    })

    expect(wrapper.find('.index__when').exists()).toBe(false)
    expect(wrapper.findAll('.index__who--from-when')).toHaveLength(2)
  })

  it('shows every row, with no button, unless it folds', () => {
    const wrapper = mount(PlainIndex, { props: { columns, rows: manyRows } })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.findAll('.index__list > li[hidden]')).toHaveLength(0)
  })

  it('does not fold when it has no more rows than it would show closed', () => {
    const wrapper = mount(PlainIndex, { props: { columns, rows, more } })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.findAll('.index__list > li[hidden]')).toHaveLength(0)
    expect(wrapper.get('.index').classes()).not.toContain('index--folds')
  })

  describe('when it folds', () => {
    const mountFolded = () => mount(PlainIndex, { props: { columns, rows: manyRows, more } })
    /** The numbers of the rows that show. */
    const showing = (wrapper: ReturnType<typeof mountFolded>) =>
      wrapper.findAll('.index__list > li:not([hidden]) > .index__no').map((no) => no.text())

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts with its first three rows, and a button that says how many more there are', () => {
      const wrapper = mountFolded()
      const button = wrapper.get('button')

      expect(showing(wrapper)).toEqual(['01', '02', '03'])
      expect(button.text()).toBe('3')
      expect(button.attributes('aria-label')).toBe('3 more employers')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBe(wrapper.get('.index__list').attributes('id'))
    })

    it('keeps the rows that are folded away in the page', () => {
      expect(mountFolded().findAll('.index__list > li')).toHaveLength(6)
    })

    it('has the button after the rows, so that it is under the last one that shows', () => {
      const children = [...mountFolded().get('.index').element.children]

      expect(children.map((child) => child.className.split(' ').pop())).toEqual([
        'index__head',
        'index__list',
        'index__fold',
      ])
    })

    it('brings out the rest a row at a time when it is opened', async () => {
      const wrapper = mountFolded()
      const button = wrapper.get('button')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
      expect(showing(wrapper)).toEqual(['01', '02', '03', '04'])

      vi.advanceTimersByTime(STEP_MS)
      await nextTick()
      expect(showing(wrapper)).toEqual(['01', '02', '03', '04', '05'])

      vi.advanceTimersByTime(STEP_MS)
      await nextTick()
      expect(showing(wrapper)).toEqual(['01', '02', '03', '04', '05', '06'])
    })

    it('takes them away again from the last one up when it is closed', async () => {
      const wrapper = mountFolded()
      const button = wrapper.get('button')
      await button.trigger('click')
      vi.runAllTimers()
      await nextTick()

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(showing(wrapper)).toEqual(['01', '02', '03', '04', '05'])

      vi.runAllTimers()
      await nextTick()
      expect(showing(wrapper)).toEqual(['01', '02', '03'])
    })

    it('leaves the page where it is while it opens', async () => {
      const wrapper = mountFolded()

      await wrapper.get('button').trigger('click')
      vi.runAllTimers()
      await nextTick()

      expect(scrollBy).not.toHaveBeenCalled()
    })

    it('scrolls the page by as much as the button moves, each time a row goes', async () => {
      const wrapper = mountFolded()
      const button = wrapper.get('button')
      await button.trigger('click')
      vi.runAllTimers()
      await nextTick()

      // Where it is when it is pressed, and then where each row that goes leaves it.
      placeButton(button.element, 700, 650, 640, 700)
      await button.trigger('click')
      vi.advanceTimersByTime(STEP_MS)
      await nextTick()
      vi.advanceTimersByTime(STEP_MS)
      await nextTick()

      // The third row left it where it was held, so the page stayed where it was.
      expect(scrollBy.mock.calls).toEqual([
        [0, -50],
        [0, -60],
      ])
    })

    it('leaves the page alone when the button is off screen', async () => {
      const wrapper = mountFolded()
      const button = wrapper.get('button')
      await button.trigger('click')
      vi.runAllTimers()
      await nextTick()

      placeButton(button.element, window.innerHeight + 200)
      await button.trigger('click')
      vi.runAllTimers()
      await nextTick()

      expect(showing(wrapper)).toEqual(['01', '02', '03'])
      expect(scrollBy).not.toHaveBeenCalled()
    })

    it('opens in one go when the visitor prefers reduced motion', async () => {
      preferReducedMotion(true)
      const wrapper = mountFolded()

      await wrapper.get('button').trigger('click')

      expect(showing(wrapper)).toEqual(['01', '02', '03', '04', '05', '06'])
    })
  })
})
