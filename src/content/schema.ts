import type { NameVariant, Slot } from '@/vault/names'
import type { ContactChannel } from './site'

export type Locale = 'en' | 'sv'

/** A hidden name inside running text. */
export interface NameRef {
  readonly slot: Slot
  readonly variant: NameVariant
}

/** Prose that may mention hidden names: plain strings with references in between. */
export type RichText = readonly (string | NameRef)[]

/** The company on a row: its slot while the name is hidden, or the name itself when it is public. */
export type Company = Slot | { readonly name: string }

export interface Project {
  readonly client: Company
  readonly years: string
  /** The kind of company, in words that do not identify it. */
  readonly sector: string
  readonly role: string
  readonly stack: readonly string[]
  /** One entry per paragraph. */
  readonly story: readonly RichText[]
}

export interface Engagement {
  readonly client: Company
  readonly sector?: string
  readonly work: string
}

export interface Job {
  /** Employers are named openly. */
  readonly employer: string
  readonly years: string
  readonly title: string
}

export interface Course {
  readonly years: string
  readonly school: string
  readonly programme: string
}

export interface Fact {
  readonly label: string
  readonly value: string
}

export interface Principle {
  readonly title: string
  readonly body: string
}

export interface PageMeta {
  readonly title: string
  readonly description: string
}

/** Everything a visitor can read, in one language. Both locales implement this in full. */
export interface Content {
  readonly locale: Locale
  readonly title: string
  readonly tagline: string
  readonly meta: { readonly index: PageMeta; readonly notFound: PageMeta }

  readonly nav: {
    readonly skip: string
    readonly language: string
    readonly invert: string
  }

  readonly vault: {
    readonly client: string
    /** Accessible name of a redacted cell, given its visible label ("Client 03"). */
    readonly hiddenName: (label: string) => string
    readonly passphrase: string
    readonly withheld: (count: number) => string
    readonly hint: string
    readonly entering: string
    readonly checking: string
    readonly denied: string
    readonly unavailable: string
    readonly declassified: (count: number) => string
    readonly lock: string
  }

  /** The page, top to bottom. */
  readonly index: {
    /** The opening statement, set large. */
    readonly lead: RichText
    readonly about: {
      readonly heading: string
      readonly portraitAlt: string
      readonly facts: readonly Fact[]
      /** One entry per paragraph. */
      readonly bio: readonly RichText[]
    }
    /** The headings over the columns of the lists. Each list uses the ones that fit it. */
    readonly columns: {
      readonly number: string
      readonly years: string
      readonly client: string
      readonly role: string
      readonly stack: string
      readonly sector: string
      readonly project: string
      readonly employer: string
      readonly school: string
      readonly programme: string
      readonly principle: string
      readonly practice: string
      readonly channel: string
      readonly address: string
    }
    readonly work: {
      readonly heading: string
      /** Accessible name of a row's expand button, given what the row shows for its client. */
      readonly details: (label: string) => string
      readonly projects: readonly Project[]
    }
    readonly clients: {
      readonly heading: string
      /** On the row that opens the list, given how many clients are in it. */
      readonly showAll: (count: number) => string
      /** On the same row once the list is open. */
      readonly hide: string
      readonly engagements: readonly Engagement[]
    }
    readonly experience: { readonly heading: string; readonly jobs: readonly Job[] }
    readonly education: { readonly heading: string; readonly courses: readonly Course[] }
    readonly approach: { readonly heading: string; readonly principles: readonly Principle[] }
    readonly contact: {
      readonly heading: string
      readonly lead: string
      readonly channels: Readonly<Record<ContactChannel, string>>
    }
  }

  readonly notFound: {
    readonly heading: string
    readonly body: string
    readonly back: string
  }

  readonly footer: {
    readonly source: string
    readonly print: string
  }
}
