import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'

import { provideContent } from '@/content/context'
import { content } from '@/content/en'
import { SLOTS, type Names, type NameVariant, type Slot } from '@/vault/names'
import { installVault, type Vault, type VaultPhase } from '@/vault/vault'
import RedactedName from '../RedactedName.vue'

const names = Object.fromEntries(SLOTS.map((slot) => [slot, { name: `Name ${slot}` }])) as Names

/** A vault with the real shape and no cryptography: the test drives its state directly. */
function fakeVault() {
  const activeField = ref<string | null>(null)
  const phase = ref<VaultPhase>('locked')
  const revealed = shallowRef<Names | null>(null)

  const vault = {
    phase,
    names: revealed,
    activeField,
    pulse: ref(0),
    denials: ref(0),
    revealStyle: ref('instant'),
    supported: ref(true),
    begin: vi.fn<Vault['begin']>((fieldId) => {
      activeField.value = fieldId
    }),
    cancel: vi.fn<Vault['cancel']>(() => {
      activeField.value = null
    }),
    keystroke: vi.fn<Vault['keystroke']>(),
    attempt: vi.fn<Vault['attempt']>(() => Promise.resolve(false)),
    lock: vi.fn<Vault['lock']>(),
    resume: vi.fn<Vault['resume']>(() => Promise.resolve()),
  } satisfies Vault

  function open(): void {
    revealed.value = names
    activeField.value = null
    phase.value = 'unlocked'
  }

  return { vault, open }
}

function mountCell(vault: Vault, props: { slotId: Slot; variant?: NameVariant }) {
  // RedactedName reads its labels from the locale root above it, so give it one.
  const Root = defineComponent({
    setup() {
      provideContent(content)
      return () => h(RedactedName, props)
    },
  })

  return mount(Root, {
    attachTo: document.body,
    global: { plugins: [(app) => installVault(app, vault)] },
  })
}

beforeEach(() => {
  document.body.innerHTML = ''
  // jsdom has no matchMedia. Answering "reduce" also switches the text effects off.
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: true } as MediaQueryList)
})

describe('RedactedName', () => {
  it('is a labelled button while the vault is locked', () => {
    const { vault } = fakeVault()

    const button = mountCell(vault, { slotId: 'c03' }).get('button')

    expect(button.text()).toBe('Client 03')
    expect(button.attributes('aria-label')).toBe(
      'Client 03, name hidden. Press to enter the passphrase.',
    )
  })

  it('labels employers as employers', () => {
    const { vault } = fakeVault()

    expect(mountCell(vault, { slotId: 'e02' }).get('button').text()).toBe('Employer 02')
  })

  it('becomes a focused passphrase field when pressed', async () => {
    const { vault } = fakeVault()
    const wrapper = mountCell(vault, { slotId: 'c03' })

    await wrapper.get('button').trigger('click')
    await nextTick()

    const field = wrapper.get('input')
    expect(field.attributes('aria-label')).toBe('Passphrase')
    expect(document.activeElement).toBe(field.element)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reports keystrokes and submits what was typed on Enter', async () => {
    const { vault } = fakeVault()
    const wrapper = mountCell(vault, { slotId: 'c03' })
    await wrapper.get('button').trigger('click')

    const field = wrapper.get('input')
    await field.setValue('open sesame please now')
    await field.trigger('keydown', { key: 'Enter' })

    expect(vault.keystroke).toHaveBeenCalledOnce()
    expect(vault.attempt).toHaveBeenCalledExactlyOnceWith('open sesame please now')
  })

  it('tries quietly once the typing pauses', async () => {
    vi.useFakeTimers()
    const { vault } = fakeVault()
    const wrapper = mountCell(vault, { slotId: 'c03' })
    await wrapper.get('button').trigger('click')

    await wrapper.get('input').setValue('open sesame please now')
    expect(vault.attempt).not.toHaveBeenCalled()

    vi.advanceTimersByTime(600)
    expect(vault.attempt).toHaveBeenCalledExactlyOnceWith('open sesame please now', { quiet: true })
    vi.useRealTimers()
  })

  it('goes back to a focused button on Escape', async () => {
    const { vault } = fakeVault()
    const wrapper = mountCell(vault, { slotId: 'c03' })
    await wrapper.get('button').trigger('click')

    await wrapper.get('input').trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect(vault.cancel).toHaveBeenCalled()
    expect(document.activeElement).toBe(wrapper.get('button').element)
  })

  it('shows the real name once the vault is open', async () => {
    const { vault, open } = fakeVault()
    const wrapper = mountCell(vault, { slotId: 'c03' })

    open()
    await nextTick()

    expect(wrapper.text()).toBe('Name c03')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows a variant when there is one and falls back to the name when there is not', async () => {
    const { vault, open } = fakeVault()
    const withVariant = mountCell(vault, { slotId: 'c05', variant: 'site' })
    const withoutVariant = mountCell(vault, { slotId: 'c06', variant: 'site' })

    open()
    vault.names.value = { ...names, c05: { name: 'Full Name', site: 'example.org' } }
    await nextTick()

    expect(withVariant.text()).toBe('example.org')
    expect(withoutVariant.text()).toBe('Name c06')
  })
})
