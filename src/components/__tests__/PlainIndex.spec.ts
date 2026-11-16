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
