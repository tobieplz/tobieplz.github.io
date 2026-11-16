import type { RichText } from '@/content/schema'

/** One line of a plain index: a number, an optional date or label, a name and what it was. */
export interface PlainRow {
  readonly no: string
  /** Leave out to let `who` start one column earlier. */
  readonly when?: string
  readonly who: RichText
  /** Leave out to let `who` run to the end of the row. */
  readonly what?: string
}
