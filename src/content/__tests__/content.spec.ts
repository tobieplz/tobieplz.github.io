import { describe, expect, it } from 'vitest'

import { SLOTS } from '@/vault/names'
import { content as en } from '../en'
import type { Content, RichText } from '../schema'
import { content as sv } from '../sv'
import { dotted, hidden, text } from '../text'

/** The slots a locale mentions, in order: what a reader would see as black cells. */
function slotsIn(content: Content): string[] {
  const inProse = (paragraphs: readonly RichText[]) =>
    paragraphs.flat().flatMap((segment) => (typeof segment === 'string' ? [] : [segment.slot]))

  return [
    ...content.index.work.projects.flatMap((project) => [
      project.client,
      ...inProse(project.story),
    ]),
    ...content.index.clients.engagements.map((engagement) => engagement.client),
    ...content.index.experience.jobs.map((job) => job.employer),
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
    expect(text`${hidden('e01')}`).toEqual([{ slot: 'e01', variant: 'name' }])
  })
})

describe('dotted', () => {
  it('joins items with a dot that stays on the line of the item before it', () => {
    expect(dotted(['Vue', 'Figma', 'CSS'])).toBe('Vue\u00a0· Figma\u00a0· CSS')
    expect(dotted(['Vue'])).toBe('Vue')
  })
})
