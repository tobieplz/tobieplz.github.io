import { describe, expect, it } from 'vitest'

import { SLOTS, slotNumber } from '@/vault/names'
import { content as en } from '../en'
import type { Company, Content, RichText } from '../schema'
import { content as sv } from '../sv'
import { dotted, hidden, numbered, text } from '../text'

/** Every client with a row of its own, in the order of the page. */
function clientsIn(content: Content): Company[] {
  return [
    ...content.index.work.projects.map((project) => project.client),
    ...content.index.clients.engagements.map((engagement) => engagement.client),
  ]
}

/** The slots a locale mentions, in order: what a reader would see as redacted cells. */
function slotsIn(content: Content): string[] {
  const inProse = (paragraphs: readonly RichText[]) =>
    paragraphs.flat().flatMap((segment) => (typeof segment === 'string' ? [] : [segment.slot]))
  const slotOf = (company: Company) => (typeof company === 'string' ? [company] : [])

  return [
    ...content.index.work.projects.flatMap((project) => [
      ...slotOf(project.client),
      ...inProse(project.story),
    ]),
    ...content.index.clients.engagements.flatMap((engagement) => slotOf(engagement.client)),
    ...inProse([content.index.lead, ...content.index.about.bio]),
  ]
}

describe('the two languages', () => {
  it('mention the same hidden names in the same places', () => {
    expect(slotsIn(sv)).toEqual(slotsIn(en))
  })

  it('give every hidden name somewhere to appear', () => {
    expect(new Set(slotsIn(en))).toEqual(new Set(SLOTS))
  })

  it('number every hidden name after the row it is on', () => {
    const hiddenRows = clientsIn(en).flatMap((client, position) =>
      typeof client === 'string' ? [{ slot: client, row: numbered(position) }] : [],
    )

    expect(hiddenRows.map(({ slot }) => slotNumber(slot))).toEqual(hiddenRows.map(({ row }) => row))
  })

  it('name the same companies openly', () => {
    const named = (content: Content) => ({
      clients: clientsIn(content),
      employers: content.index.experience.jobs.map((job) => job.employer),
    })

    expect(named(sv)).toEqual(named(en))
  })

  it('agree on the facts that do not translate', () => {
    // "2023–now" and "2023–nu" are the same years: only the digits have to match.
    const digits = (years: string) => years.replace(/\D+$/, '')

    const facts = (content: Content) => ({
      projects: content.index.work.projects.map(({ years, stack, story }) => ({
        years: digits(years),
        stack,
        paragraphs: story.length,
      })),
      jobs: content.index.experience.jobs.map(({ years }) => digits(years)),
      courses: content.index.education.courses.map(({ years, school }) => ({ years, school })),
      bioParagraphs: content.index.about.bio.length,
      facts: content.index.about.facts.length,
      principles: content.index.approach.principles.length,
    })

    expect(facts(sv)).toEqual(facts(en))
  })

  it('name the button that shows more clients with the number that is on it', () => {
    // Someone who talks to their device can only say what they see.
    expect(en.index.clients.more(10)).toContain('10')
    expect(sv.index.clients.more(10)).toContain('10')
  })
})

describe('text', () => {
  it('splits a template into strings and name references', () => {
    expect(text`Built for ${hidden('c01')} and ${hidden('c05', 'site')}.`).toEqual([
      'Built for ',
      { slot: 'c01', variant: 'name' },
      ' and ',
      { slot: 'c05', variant: 'site' },
      '.',
    ])
  })

  it('drops the empty strings around a reference at either end', () => {
    expect(text`${hidden('c01')}`).toEqual([{ slot: 'c01', variant: 'name' }])
  })
})

describe('numbered', () => {
  it('counts from one and pads to two digits', () => {
    expect([0, 8, 20].map(numbered)).toEqual(['01', '09', '21'])
  })
})

describe('dotted', () => {
  it('joins items with a dot that stays on the line of the item before it', () => {
    expect(dotted(['Vue', 'Figma', 'CSS'])).toBe('Vue\u00a0· Figma\u00a0· CSS')
    expect(dotted(['Vue'])).toBe('Vue')
  })
})
