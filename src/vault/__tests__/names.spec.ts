import { describe, expect, it } from 'vitest'

import { parseNames, SLOTS, slotKind, slotNumber } from '../names'

function completeNames(): Record<string, Record<string, unknown>> {
  return Object.fromEntries(SLOTS.map((slot) => [slot, { name: `Name ${slot}` }]))
}

describe('parseNames', () => {
  it('accepts one entry per slot, with optional variants', () => {
    const names = completeNames()
    names.c05 = { name: 'Some Client', short: 'Some', site: 'some.example' }

    expect(parseNames(names).c05.site).toBe('some.example')
  })

  it('rejects a missing slot', () => {
    const names = completeNames()
    delete names.e06

    expect(() => parseNames(names)).toThrow('Missing slot ids: e06')
  })

  it('rejects an unknown slot', () => {
    expect(() => parseNames({ ...completeNames(), c99: { name: 'Extra' } })).toThrow('c99')
  })

  it('rejects an empty name', () => {
    expect(() => parseNames({ ...completeNames(), c01: { name: ' ' } })).toThrow('c01')
  })

  it('rejects an unknown variant', () => {
    const names = { ...completeNames(), c01: { name: 'Client', nickname: 'C' } }

    expect(() => parseNames(names)).toThrow('c01.nickname')
  })

  it('rejects anything that is not an object', () => {
    expect(() => parseNames(['c01'])).toThrow('JSON object')
  })
})

describe('slot helpers', () => {
  it('reads the kind and number off the id', () => {
    expect(slotKind('c03')).toBe('client')
    expect(slotKind('e02')).toBe('employer')
    expect(slotNumber('c03')).toBe('03')
  })
})
