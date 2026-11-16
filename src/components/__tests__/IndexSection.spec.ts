import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { useDisclosure } from '../disclosure'
import IndexSection from '../IndexSection.vue'

/** Stands in for a list: says what the section around it tells it. */
const Inside = defineComponent({
  setup() {
    const section = useDisclosure()
    return () => h('p', { class: 'inside' }, section ? String(section.open.value) : 'no section')
  },
})

function mountSection(props: { count?: number; joined?: boolean; collapsible?: boolean } = {}) {
  return mount(IndexSection, {
    props: { number: '03', heading: 'More clients', ...props },
    slots: { default: () => h(Inside) },
  })
}

describe('IndexSection', () => {
  it('is named after its heading and shows its content', () => {
    const wrapper = mountSection()
    const heading = wrapper.get('h2')

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(heading.text()).toBe('More clients')
    expect(wrapper.find('.inside').exists()).toBe(true)
  })

  it('shows a count in two digits, and leaves it out when there is none', () => {
    expect(mountSection({ count: 7 }).get('.section__count').text()).toBe('(07)')
    expect(mountSection().find('.section__count').exists()).toBe(false)
  })

  it('marks a section that is joined to the one above it', () => {
    expect(mountSection({ joined: true }).get('section').classes()).toContain('section--joined')
    expect(mountSection().get('section').classes()).not.toContain('section--joined')
  })

  it('has a plain heading, and tells its content nothing, unless it is collapsible', () => {
    const wrapper = mountSection()

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.get('.inside').text()).toBe('no section')
  })

  describe('when it is collapsible', () => {
    it('starts closed, with its heading as the button, and tells its content so', () => {
      const wrapper = mountSection({ collapsible: true })
      const button = wrapper.get('h2 button')

      expect(button.text()).toBe('More clients')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBe(
        wrapper.get('.section__body').attributes('id'),
      )
      expect(wrapper.get('.inside').text()).toBe('false')
    })

    it('opens and closes when the heading is pressed', async () => {
      const wrapper = mountSection({ collapsible: true })
      const button = wrapper.get('h2 button')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
      expect(wrapper.get('.inside').text()).toBe('true')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(wrapper.get('.inside').text()).toBe('false')
    })

    it('shows a minus beside the label only while it is open', async () => {
      const wrapper = mountSection({ collapsible: true })

      expect(wrapper.find('.section__sign').exists()).toBe(false)

      await wrapper.get('h2 button').trigger('click')
      expect(wrapper.get('.section__sign').attributes('aria-hidden')).toBe('true')
    })

    it('keeps its content in the page while it is closed', () => {
      expect(mountSection({ collapsible: true }).find('.inside').exists()).toBe(true)
    })
  })
})
