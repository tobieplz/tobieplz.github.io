import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, withDirectives } from 'vue'

import { STEP_MS } from '@/composables/motion'
import { vFeed } from '../feed'

/** jsdom has no matchMedia, so the visitor's wish for less motion is answered here. */
function preferReducedMotion(reduce: boolean): void {
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: reduce } as MediaQueryList)
}

/**
 * A block of two paragraphs with lines 20px tall: three lines under 8px of
 * space, a gap of 16px, and then two lines over 32px of space. jsdom lays
 * nothing out, so the boxes are given here, with the block 100px down the page.
 */
const Block = defineComponent({
  props: { open: Boolean },
  setup: (props) => () =>
    withDirectives(
      h('div', { style: 'line-height: 20px' }, [
        h('p', { style: 'padding-top: 8px' }),
        h('p', { style: 'padding-bottom: 32px' }),
      ]),
      [[vFeed, props.open]],
    ),
})

const box = (top: number, height: number) => ({ top, height, bottom: top + height }) as DOMRect

function mountBlock(open: boolean) {
  const wrapper = mount(Block, { props: { open } })
  const block = wrapper.element as HTMLElement
  const [first, second] = block.children as unknown as [HTMLElement, HTMLElement]

  block.getBoundingClientRect = () => box(100, open ? 156 : 0)
  first.getBoundingClientRect = () => box(100, 68)
  second.getBoundingClientRect = () => box(184, 72)

  const running = { cancel: vi.fn<() => void>() }
  block.getAnimations = () => [running as unknown as Animation]
  block.animate = vi.fn<HTMLElement['animate']>()

  return { wrapper, animate: vi.mocked(block.animate), running }
}

/** The heights of the steps an animation goes through, and how long it takes. */
function steps(animate: ReturnType<typeof mountBlock>['animate']) {
  const [frames, timing] = animate.mock.lastCall ?? []
  return {
    heights: (frames as Keyframe[]).map((frame) => frame.height),
    duration: (timing as KeyframeAnimationOptions).duration,
  }
}

describe('v-feed', () => {
  beforeEach(() => {
    preferReducedMotion(false)
  })

  it('leaves the block alone until it is opened or closed', async () => {
    const { wrapper, animate } = mountBlock(false)

    await wrapper.setProps({ open: false })

    expect(animate).not.toHaveBeenCalled()
  })

  it('brings the text out two lines at a time, and the last of it with the space under it', async () => {
    const { wrapper, animate } = mountBlock(false)

    await wrapper.setProps({ open: true })

    // Under the second line, under the fourth (the first of the second paragraph), then all of it.
    expect(steps(animate)).toEqual({ heights: ['48px', '104px', '156px'], duration: 2 * STEP_MS })
  })

  it('takes it back the same way', async () => {
    const { wrapper, animate } = mountBlock(true)

    await wrapper.setProps({ open: false })

    expect(steps(animate)).toEqual({ heights: ['104px', '48px', '0px'], duration: 2 * STEP_MS })
  })

  it('holds each height until the next, and keeps the text in sight on the way', async () => {
    const { wrapper, animate } = mountBlock(true)

    await wrapper.setProps({ open: false })

    const [frames] = animate.mock.lastCall ?? []
    for (const frame of frames as Keyframe[]) {
      expect(frame).toMatchObject({ easing: 'step-end', visibility: 'visible' })
    }
  })

  it('stops what is still moving before it starts again', async () => {
    const { wrapper, running } = mountBlock(false)

    await wrapper.setProps({ open: true })

    expect(running.cancel).toHaveBeenCalledOnce()
  })

  it('moves nothing when the visitor prefers reduced motion', async () => {
    preferReducedMotion(true)
    const { wrapper, animate } = mountBlock(false)

    await wrapper.setProps({ open: true })

    expect(animate).not.toHaveBeenCalled()
  })
})
