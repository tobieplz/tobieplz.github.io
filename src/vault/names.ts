/**
 * Neutral ids for every hidden client name, and the shape of the private data
 * behind them. Public code and copy only ever use the ids; the real names live
 * in the sealed vault.
 *
 * A slot is numbered after the row its client has on the page, which is the
 * number a reader sees on the black cell. A row whose company is named openly
 * has no slot, so the numbers have gaps.
 *
 * No imports here either: the Node scripts load this file directly.
 */

export const SLOTS = [
  'c01',
  'c02',
  'c03',
  'c04',
  'c05',
  'c06',
  'c08',
  'c10',
  'c11',
  'c13',
  'c15',
  'c16',
  'c17',
  'c18',
  'c19',
  'c20',
  'c21',
] as const

export type Slot = (typeof SLOTS)[number]

/** The two digits shown on a redacted cell: `c03` reads "Client 03". */
export function slotNumber(slot: Slot): string {
  return slot.slice(1)
}

/**
 * One hidden name. `short` and `site` are optional variants for use inside a
 * sentence, where the full name would read badly.
 */
export interface NameEntry {
  readonly name: string
  readonly short?: string
  readonly site?: string
}

export type NameVariant = keyof NameEntry
export type Names = Readonly<Record<Slot, NameEntry>>

const VARIANTS: readonly NameVariant[] = ['name', 'short', 'site']

/** Checks that `value` has exactly one well-formed entry per slot. */
export function parseNames(value: unknown): Names {
  if (!isRecord(value)) throw new Error('Names must be a JSON object keyed by slot id')

  const unknownKeys = Object.keys(value).filter((key) => !SLOTS.includes(key as Slot))
  if (unknownKeys.length > 0) throw new Error(`Unknown slot ids: ${unknownKeys.join(', ')}`)

  const missing = SLOTS.filter((slot) => !(slot in value))
  if (missing.length > 0) throw new Error(`Missing slot ids: ${missing.join(', ')}`)

  for (const slot of SLOTS) {
    const entry = value[slot]
    if (!isRecord(entry) || !isFilled(entry.name)) {
      throw new Error(`${slot} needs a non-empty "name"`)
    }
    for (const [key, variant] of Object.entries(entry)) {
      if (!VARIANTS.includes(key as NameVariant) || !isFilled(variant)) {
        throw new Error(`${slot}.${key} must be one of ${VARIANTS.join(', ')} and non-empty`)
      }
    }
  }

  return value as Names
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
