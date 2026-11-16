import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import IndexSection from '../IndexSection.vue'

function mountSection(props: { count?: number; joined?: boolean } = {}) {
  return mount(IndexSection, {
    props: { number: '03', heading: 'More clients', ...props },
    slots: { default: '<p class="content">The list</p>' },
  })
}

describe('IndexSection', () => {
  it('is named after its heading and shows its content', () => {
    const wrapper = mountSection()
    const heading = wrapper.get('h2')

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.text()).toBe('More clients')
    expect(wrapper.get('.content').text()).toBe('The list')
  })

  it('shows a count in two digits, and leaves it out when there is none', () => {
    expect(mountSection({ count: 7 }).get('.section__count').text()).toBe('(07)')
    expect(mountSection().find('.section__count').exists()).toBe(false)
  })

  it('marks a section that is joined to the one above it', () => {
    expect(mountSection({ joined: true }).get('section').classes()).toContain('section--joined')
    expect(mountSection().get('section').classes()).not.toContain('section--joined')
  })
})
