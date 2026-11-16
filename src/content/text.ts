import type { NameVariant, Slot } from '@/vault/names'
import type { NameRef, RichText } from './schema'

/** Refers to a hidden name by its slot. The slot id is checked at compile time. */
export function hidden(slot: Slot, variant: NameVariant = 'name'): NameRef {
  return { slot, variant }
}

/** Row numbers as they are printed: 01, 02, 03 for positions 0, 1, 2. */
export function numbered(position: number): string {
  return String(position + 1).padStart(2, '0')
}

/**
 * Sets a short list on one line with dots between the items. The space before
 * a dot does not break, so a wrapped line never starts with one.
 */
export function dotted(items: readonly string[]): string {
  return items.join('\u00a0· ')
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
