import type { NameVariant, Slot } from '@/vault/names'
import type { NameRef, RichText } from './schema'

/** Refers to a hidden name by its slot. The slot id is checked at compile time. */
export function hidden(slot: Slot, variant: NameVariant = 'name'): NameRef {
  return { slot, variant }
}

/**
 * Tagged template for prose that mentions hidden names:
 *
 *   text`Frontend developer at ${hidden('c03')}.`
 */
export function text(strings: TemplateStringsArray, ...refs: NameRef[]): RichText {
  return strings
    .flatMap((part, index) => {
      const ref = refs[index]
      return ref ? [part, ref] : [part]
    })
    .filter((segment) => segment !== '')
}
