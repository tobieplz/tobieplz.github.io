import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PlainIndex from '../PlainIndex.vue'
import type { PlainColumns, PlainRow } from '../types'

const columns: PlainColumns = { no: 'No.', when: 'Years', who: 'Employer', what: 'Role' }
const rows: PlainRow[] = [
  { no: '01', when: '2023–now', who: ['Some Company'], what: 'Developer' },
  { no: '02', when: '', who: ['Another Company'], what: 'Designer' },
]

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

  it('is open, with no row to close it, unless it is collapsible', () => {
    const wrapper = mount(PlainIndex, { props: { columns, rows } })

    expect(wrapper.find('.index__more').exists()).toBe(false)
    expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()
  })

  describe('when it is collapsible', () => {
    const collapsible = { show: 'Show all 2', hide: 'Hide the list' }
    const mountClosed = () => mount(PlainIndex, { props: { columns, rows, collapsible } })

    it('starts closed, under its headings, with a button that says what it opens', () => {
      const wrapper = mountClosed()
      const button = wrapper.get('.index__more button')
      const list = wrapper.get('.index__list')

      expect(wrapper.find('.index__head').exists()).toBe(true)
      expect(wrapper.get('.index__more-text').text()).toBe('Show all 2')
      expect(button.attributes('aria-label')).toBe('Show all 2')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBe(list.attributes('id'))
      expect(list.attributes('hidden')).toBeDefined()
      expect(list.findAll('li')).toHaveLength(2)
    })

    it('opens and closes from the button', async () => {
      const wrapper = mountClosed()
      const button = wrapper.get('.index__more button')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
      expect(button.attributes('aria-label')).toBe('Hide the list')
      expect(wrapper.get('.index__more-text').text()).toBe('Hide the list')
      expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(wrapper.get('.index__list').attributes('hidden')).toBeDefined()
    })

    it('opens from anywhere on the row as well', async () => {
      const wrapper = mountClosed()

      await wrapper.get('.index__more-text').trigger('click')

      expect(wrapper.get('.index__more button').attributes('aria-expanded')).toBe('true')
      expect(wrapper.get('.index__list').attributes('hidden')).toBeUndefined()
    })
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
})
