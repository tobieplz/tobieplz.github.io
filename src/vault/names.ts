/**
 * Neutral ids for every hidden company name, and the shape of the private data
 * behind them. Public code and copy only ever use the ids; the real names live
 * in the sealed vault.
 *
 * No imports here either: the Node scripts load this file directly.
 */

export const CLIENT_SLOTS = [
  'c01',
  'c02',
  'c03',
  'c04',
  'c05',
  'c06',
  'c07',
  'c08',
  'c09',
  'c10',
  'c11',
  'c12',
  'c13',
  'c14',
  'c15',
  'c16',
  'c17',
  'c18',
  'c19',
  'c20',
] as const

export const EMPLOYER_SLOTS = ['e01', 'e02', 'e03', 'e04', 'e05', 'e06'] as const

export type ClientSlot = (typeof CLIENT_SLOTS)[number]
export type EmployerSlot = (typeof EMPLOYER_SLOTS)[number]
export type Slot = ClientSlot | EmployerSlot
export type SlotKind = 'client' | 'employer'

export const SLOTS: readonly Slot[] = [...CLIENT_SLOTS, ...EMPLOYER_SLOTS]

export function slotKind(slot: Slot): SlotKind {
  return slot.startsWith('c') ? 'client' : 'employer'
}

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
