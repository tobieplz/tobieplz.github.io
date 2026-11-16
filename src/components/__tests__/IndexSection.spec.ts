import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import IndexSection from '../IndexSection.vue'

function mountSection(props: { collapsible?: boolean; count?: number } = {}) {
  return mount(IndexSection, {
    props: { number: '03', heading: 'More clients', ...props },
    slots: { default: '<p class="content">The list</p>' },
    attachTo: document.body,
  })
}

describe('IndexSection', () => {
  it('is named after its heading and shows its content', () => {
    const wrapper = mountSection({ count: 7 })
    const heading = wrapper.get('h2')

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.text()).toBe('More clients')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.get('.section__count').text()).toBe('(07)')
    expect(wrapper.get('.section__body').attributes('hidden')).toBeUndefined()
  })

  it('starts closed when it is collapsible, with its heading as the button', () => {
    const wrapper = mountSection({ collapsible: true })
    const button = wrapper.get('h2 button')
    const body = wrapper.get('.section__body')

    expect(button.text()).toBe('More clients')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-controls')).toBe(body.attributes('id'))
    expect(body.attributes('hidden')).toBeDefined()
    expect(wrapper.get('section').classes()).toContain('section--closed')
  })

  it('opens and closes when the heading is pressed', async () => {
    const wrapper = mountSection({ collapsible: true })
    const button = wrapper.get('h2 button')
    const body = wrapper.get('.section__body')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(body.attributes('hidden')).toBeUndefined()
    expect(wrapper.get('section').classes()).not.toContain('section--closed')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(body.attributes('hidden')).toBeDefined()
  })

  it('keeps its content in the page while it is closed', () => {
    const wrapper = mountSection({ collapsible: true })

    expect(wrapper.get('.content').text()).toBe('The list')
  })
})
