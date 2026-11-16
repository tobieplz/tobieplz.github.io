<script setup lang="ts">
/** The page: a CV as one numbered index. */
import portraitSmall from '@/assets/portrait-small.webp'
import portraitSize from '@/assets/portrait.json'
import portrait from '@/assets/portrait.webp'
import IndexSection from '@/components/IndexSection.vue'
import PlainIndex from '@/components/PlainIndex.vue'
import RichText from '@/components/RichText.vue'
import WorkIndex from '@/components/WorkIndex.vue'
import type { PlainRow } from '@/components/types'
import { usePageHead } from '@/composables/usePageHead'
import { useContent } from '@/content/context'
import type { Company } from '@/content/schema'
import { site, type ContactChannel } from '@/content/site'
import { hidden, numbered } from '@/content/text'

const { index } = useContent()

usePageHead('index')

/** `pnpm portrait` writes the photo in two sizes; the browser takes the one that fits. */
const portraitSources = `${portraitSmall} ${portraitSize.smallWidth}w, ${portrait} ${portraitSize.width}w`
/** How wide the photo is shown: beside the text from 56rem up, above it on narrower screens. */
const PORTRAIT_SIZES = '(min-width: 72rem) 34vw, (min-width: 56rem) 43vw, min(100vw - 2rem, 24rem)'

/** What a row shows for its company: a redacted cell, or the name when that is public. */
const shown = (company: Company): PlainRow['who'] =>
  typeof company === 'string' ? [hidden(company)] : [company.name]

// The numbers continue from the main table, so that every client has one of its own.
const clientRows: PlainRow[] = index.clients.engagements.map((engagement, position) => ({
  no: numbered(index.work.projects.length + position),
  when: engagement.sector ?? '',
  who: shown(engagement.client),
  what: engagement.work,
}))

const jobRows: PlainRow[] = index.experience.jobs.map((job, position) => ({
  no: numbered(position),
  when: job.years,
  who: [job.employer],
  what: job.title,
}))

const principleRows: PlainRow[] = index.approach.principles.map((principle, position) => ({
  no: numbered(position),
  who: [principle.title],
  what: principle.body,
}))

const courseRows: PlainRow[] = index.education.courses.map((course, position) => ({
  no: numbered(position),
  when: course.years,
  who: [course.school],
  what: course.programme,
}))

const { email, linkedin, github } = site.contact
const channels: { channel: ContactChannel; href: string; text: string }[] = [
  { channel: 'email' as const, href: `mailto:${email}`, text: email },
  {
    channel: 'linkedin' as const,
    href: linkedin,
    text: linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
  },
  {
    channel: 'github' as const,
    href: `https://github.com/${github}`,
    text: `github.com/${github}`,
  },
].filter(({ channel }) => site.contact[channel] !== '')

/** The longest address decides the type size on a phone, so that none of them has to wrap. */
const addressLength = Math.max(...channels.map(({ text }) => text.length))
</script>

<template>
  <div class="intro">
    <p class="intro__lead"><RichText :text="index.lead" /></p>
  </div>

  <IndexSection number="01" :heading="index.about.heading">
    <div class="about index">
      <img
        class="about__portrait"
        :src="portrait"
        :srcset="portraitSources"
        :sizes="PORTRAIT_SIZES"
        :alt="index.about.portraitAlt"
        :width="portraitSize.width"
        :height="portraitSize.height"
        decoding="async"
      />
      <div class="about__bio prose">
        <p v-for="(paragraph, position) in index.about.bio" :key="position">
          <RichText :text="paragraph" />
        </p>
      </div>
      <dl class="about__facts label">
        <div v-for="fact in index.about.facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </div>
  </IndexSection>

  <IndexSection number="02" :heading="index.work.heading" :count="index.work.projects.length">
    <WorkIndex :projects="index.work.projects" />
  </IndexSection>

  <IndexSection number="03" :heading="index.clients.heading" :count="clientRows.length" joined>
    <PlainIndex :rows="clientRows" />
  </IndexSection>

  <IndexSection number="04" :heading="index.experience.heading" :count="jobRows.length" joined>
    <PlainIndex :rows="jobRows" />
  </IndexSection>

  <IndexSection number="05" :heading="index.education.heading" joined>
    <PlainIndex :rows="courseRows" />
  </IndexSection>

  <IndexSection number="06" :heading="index.approach.heading">
    <PlainIndex :rows="principleRows" />
  </IndexSection>

  <IndexSection v-if="channels.length > 0" number="07" :heading="index.contact.heading">
    <p class="contact__lead">{{ index.contact.lead }}</p>
    <ul class="index" role="list" :style="{ '--address-length': addressLength }">
      <li v-for="(entry, position) in channels" :key="entry.channel" class="index__row">
        <span class="index__no" aria-hidden="true">{{ numbered(position) }}</span>
        <span class="index__when">{{ index.contact.channels[entry.channel] }}</span>
        <span class="index__who index__who--to-end contact__link">
          <a :href="entry.href">{{ entry.text }}</a>
        </span>
      </li>
    </ul>
  </IndexSection>
</template>

<style scoped>
.intro {
  padding-block: var(--section-space);
  border-top: var(--rule-heavy) solid var(--ink);
}

.intro__lead {
  max-width: 28ch;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

/*
 * The photo and the text stand on the columns of the indexes below them (the
 * block is an `index` itself): the photo runs from the numbers to the end of
 * the names, and the text and the facts start where the descriptions do.
 */
.about {
  grid-template-rows: auto 1fr;
  row-gap: var(--space-5);
  align-items: start;
}

.about__portrait {
  grid-row: 1 / span 2;
  grid-column: no / role;
  width: 100%;
  border: var(--rule) solid var(--ink);
}

/* Two columns of facts on the two columns under them, resting on the foot of the photo. */
.about__facts {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: role / end;
  row-gap: var(--space-3);
  align-self: end;
  margin: 0;
}

.about__facts > :nth-child(odd) {
  grid-column: 1;
}

.about__facts > :nth-child(even) {
  grid-column: 2 / -1;
}

.about__facts dt {
  color: var(--quiet);
}

.about__facts dd {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--text-md);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
  text-transform: none;
}

.about__bio {
  grid-column: role / end;
}

/* Every other list ends with a rule, so this one does too. */
.index__row:last-child {
  border-bottom: var(--rule) solid var(--ink);
}

.contact__lead {
  max-width: var(--measure);
  padding-block: var(--space-3) var(--space-5);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.25;
}

.contact__link {
  font-size: var(--text-lg);
  overflow-wrap: anywhere;
}

@media (width >= 72rem) {
  /* At this width the line in the title row above already sets the intro apart. */
  .intro {
    border-top: 0;
  }

  /* Beside its section label, the block starts where the text of a first row would. */
  .about {
    padding-top: calc(var(--space-3) + var(--rule));
  }
}

/*
 * Where the index is stacked, an address has the width of a phone to fit in.
 * The type shrinks until the longest one does, taking a character to be 0.56em
 * wide on average. Below 1rem it stops shrinking and wraps instead.
 */
@media screen and (width < 56rem) {
  .contact__link {
    container-type: inline-size;
  }

  .contact__link a {
    font-size: clamp(1rem, 100cqi / (var(--address-length) * 0.56), var(--text-lg));
  }
}

/* Where the index is stacked, so is this: the photo, the text, then the facts side by side. */
@media screen and (width < 56rem) {
  .about {
    grid-template: auto / minmax(0, 1fr);
  }

  .about__portrait,
  .about__bio,
  .about__facts {
    grid-row: auto;
    grid-column: 1;
  }

  .about__portrait {
    max-width: 24rem;
  }

  .about__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--index-gap);
  }
}

@media print {
  .intro {
    padding-block: var(--space-3);
  }

  .intro__lead {
    max-width: 58ch;
  }

  /* On paper: a small photo, the facts in one column beside it, and then the text. */
  .about {
    grid-template: auto / 6rem 10rem minmax(0, 1fr);
    gap: var(--space-5);
  }

  .about__portrait {
    grid-area: 1 / 1;
  }

  .about__facts {
    display: flex;
    flex-direction: column;
    grid-area: 1 / 2;
    gap: var(--space-2);
    align-self: start;
  }

  .about__bio {
    grid-area: 1 / 3;
  }

  .contact__lead {
    break-after: avoid;
  }
}
</style>
