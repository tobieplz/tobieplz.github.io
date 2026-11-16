import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import type { RichText as Prose } from '@/content/schema'
import { hidden, text } from '@/content/text'
import RichText from '../RichText.vue'

/** Stands in for the real cell, which needs a vault: it shows the slot it was given. */
const RedactedName = defineComponent({
  props: { slotId: { type: String, required: true } },
  setup: (props) => () => h('b', props.slotId),
})

/** RichText has no element of its own, so it is rendered into a paragraph, as it is on the page. */
function render(prose: Prose) {
  const Paragraph = defineComponent({
    setup: () => () => h('p', h(RichText, { text: prose })),
  })

  return mount(Paragraph, { global: { stubs: { RedactedName } } })
}

describe('RichText', () => {
  it('renders the words and the names in order', () => {
    const wrapper = render(text`Built for ${hidden('c01')} and ${hidden('c02')} too`)

    expect(wrapper.text()).toBe('Built for c01 and c02 too')
    expect(wrapper.findAll('.together')).toHaveLength(0)
  })

  it('keeps the punctuation after a name together with the name', () => {
    const wrapper = render(text`At ${hidden('c01')}, then ${hidden('c02')}.`)

    expect(wrapper.findAll('.together').map((group) => group.text())).toEqual(['c01,', 'c02.'])
    expect(wrapper.text()).toBe('At c01, then c02.')
  })

  it('takes only the punctuation, not the words after it', () => {
    const wrapper = render(text`For ${hidden('c01')}: the whole site`)

    expect(wrapper.find('.together').text()).toBe('c01:')
    expect(wrapper.text()).toBe('For c01: the whole site')
  })

  it('renders a name that stands alone', () => {
    const wrapper = render([hidden('c03')])

    expect(wrapper.text()).toBe('c03')
    expect(wrapper.findAll('.together')).toHaveLength(0)
  })
})
