import { inject, provide, type InjectionKey, type Ref } from 'vue'

/**
 * A section that can be closed tells the list inside it. The section owns the
 * state and the button; the list shows one row in place of its rows while the
 * section is closed, and that row opens it too.
 */
export interface Disclosure {
  readonly open: Readonly<Ref<boolean>>
  toggle(): void
}

const key: InjectionKey<Disclosure> = Symbol('disclosure')

export function provideDisclosure(disclosure: Disclosure): void {
  provide(key, disclosure)
}

/** The section around this component, if it is one that can be closed. */
export function useDisclosure(): Disclosure | undefined {
  return inject(key, undefined)
}
