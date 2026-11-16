import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import { provideDisclosure, type Disclosure } from '../disclosure'
import PlainIndex from '../PlainIndex.vue'
import type { PlainColumns, PlainRow } from '../types'

const columns: PlainColumns = { no: 'No.', when: 'Years', who: 'Employer', what: 'Role' }
const rows: PlainRow[] = [
  { no: '01', when: '2023–now', who: ['Some Company'], what: 'Developer' },
  { no: '02', when: '', who: ['Another Company'], what: 'Designer' },
  { no: '03', when: '2019', who: ['A Third Company'], what: 'Developer' },
]

/** Mounts the list inside a section that can be closed, the way the page does. */
function mountInSection(startOpen: boolean) {
  const open = ref(startOpen)
  const toggle = vi.fn<Disclosure['toggle']>(() => {
    open.value = !open.value
  })
  const Section = defineComponent({
    setup() {
      provideDisclosure({ open, toggle })
      return () => h(PlainIndex, { columns, rows, summary: '3 employers' })
    },
  })

  return { wrapper: mount(Section), toggle }
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

  it('shows all its rows when the section around it cannot be closed', () => {
    const wrapper = mount(PlainIndex, { props: { columns, rows } })

    expect(wrapper.find('.index__folded').exists()).toBe(false)
    expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()
  })

  describe('in a section that is closed', () => {
    it('shows one row in place of its rows: the numbers it covers and what is in it', () => {
      const { wrapper } = mountInSection(false)
      const folded = wrapper.get('.index__folded')

      expect(wrapper.find('.index__head').exists()).toBe(true)
      expect(folded.get('.index__folded-range').text()).toBe('01–03')
      expect(folded.get('.index__folded-summary').text()).toBe('3 employers')
      expect(wrapper.get('.index__list').attributes('hidden')).toBeDefined()
    })

    it('keeps the rows in the page', () => {
      const { wrapper } = mountInSection(false)

      expect(wrapper.findAll('.index__list > li')).toHaveLength(3)
    })

    it('leaves that row to the pointer, since the heading of the section is the button', () => {
      const folded = mountInSection(false).wrapper.get('.index__folded')

      expect(folded.attributes('aria-hidden')).toBe('true')
      expect(folded.find('button').exists()).toBe(false)
    })

    it('opens the section when that row is pressed, and is then an ordinary list', async () => {
      const { wrapper, toggle } = mountInSection(false)

      await wrapper.get('.index__folded').trigger('click')

      expect(toggle).toHaveBeenCalledOnce()
      expect(wrapper.find('.index__folded').exists()).toBe(false)
      expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()
    })
  })

  it('is an ordinary list in a section that is open', () => {
    const { wrapper } = mountInSection(true)

    expect(wrapper.find('.index__folded').exists()).toBe(false)
    expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()
  })
})
