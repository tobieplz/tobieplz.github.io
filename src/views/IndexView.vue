<script setup lang="ts">
/** The page: a CV as one numbered index. */
import portrait from '@/assets/portrait.webp'
import IndexSection from '@/components/IndexSection.vue'
import PlainIndex from '@/components/PlainIndex.vue'
import RichText from '@/components/RichText.vue'
import WorkIndex from '@/components/WorkIndex.vue'
import type { PlainRow } from '@/components/types'
import { usePageHead } from '@/composables/usePageHead'
import { useContent } from '@/content/context'
import { site, type ContactChannel } from '@/content/site'
import { hidden } from '@/content/text'
import { slotNumber } from '@/vault/names'

/** `pnpm portrait` always writes a square, so these only need to state the ratio. */
const PORTRAIT_SIZE = 480

const { index } = useContent()

usePageHead('index')

const numbered = (position: number) => String(position + 1).padStart(2, '0')

// The numbers continue from the main table, so they match the labels on the cells.
const clientRows: PlainRow[] = index.clients.engagements.map((engagement) => ({
  no: slotNumber(engagement.client),
  when: engagement.sector ?? '',
  who: [hidden(engagement.client)],
  what: engagement.work,
}))

const jobRows: PlainRow[] = index.experience.jobs.map((job, position) => ({
  no: numbered(position),
  when: job.years,
  who: [hidden(job.employer)],
  what: job.title,
}))

const skillRows: PlainRow[] = index.toolbox.groups.map((group, position) => ({
  no: numbered(position),
  who: [group.label],
  what: group.skills.join(' · '),
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
        :alt="index.about.portraitAlt"
        :width="PORTRAIT_SIZE"
        :height="PORTRAIT_SIZE"
        decoding="async"
      />
      <dl class="about__facts label">
        <div v-for="fact in index.about.facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
      <div class="about__bio prose">
        <p v-for="(paragraph, position) in index.about.bio" :key="position">
          <RichText :text="paragraph" />
        </p>
      </div>
    </div>
  </IndexSection>

  <IndexSection number="02" :heading="index.work.heading" :count="index.work.projects.length">
    <WorkIndex :projects="index.work.projects" />
  </IndexSection>

  <IndexSection number="03" :heading="index.clients.heading" :count="clientRows.length">
    <PlainIndex :rows="clientRows" />
  </IndexSection>

  <IndexSection number="04" :heading="index.experience.heading" :count="jobRows.length">
    <PlainIndex :rows="jobRows" />
  </IndexSection>

  <IndexSection number="05" :heading="index.toolbox.heading">
    <PlainIndex :rows="skillRows" />
  </IndexSection>

  <IndexSection number="06" :heading="index.approach.heading">
    <PlainIndex :rows="principleRows" />
  </IndexSection>

  <IndexSection number="07" :heading="index.education.heading">
    <PlainIndex :rows="courseRows" />
  </IndexSection>

  <IndexSection v-if="channels.length > 0" number="08" :heading="index.contact.heading">
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
  /* 38px above and below: the intro keeps closer to its rules than the sections do. */
  padding-block: 2.375rem;
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
 * The photo, the facts and the text stand on the columns of the indexes below
 * them (the block is an `index` itself): the photo where the numbers and years
 * are, the facts where the names are, and the text where the descriptions are.
 */
.about {
  row-gap: var(--space-4);
  align-items: start;
}

.about__portrait {
  grid-column: no / who;
  width: 100%;
  border: var(--rule) solid var(--ink);
}

.about__facts {
  display: grid;
  grid-column: who / role;
  gap: var(--space-3);
  margin: 0;
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
    padding-block: var(--space-7);
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

/* Where the index is stacked, the photo and the facts share a line and the text gets the full width. */
@media screen and (width < 56rem) {
  .about {
    grid-template-columns: minmax(0, min(14rem, 40%)) minmax(0, 1fr);
  }

  .about__portrait {
    grid-column: 1;
  }

  .about__facts {
    grid-column: 2;
  }

  .about__bio {
    grid-column: 1 / -1;
  }
}

@media print {
  .intro {
    padding-block: var(--space-3);
  }

  .intro__lead {
    max-width: 44ch;
  }

  /* On paper the facts go under a smaller photo, which leaves the text a wider column. */
  .about {
    grid-template: auto 1fr / 11rem minmax(0, 1fr);
    gap: var(--space-3) var(--space-5);
  }

  .about__portrait {
    grid-area: 1 / 1;
    width: 6rem;
  }

  .about__facts {
    grid-area: 2 / 1;
    gap: var(--space-2);
  }

  .about__bio {
    grid-area: 1 / 2 / span 2;
  }

  .contact__lead {
    break-after: avoid;
  }
}
</style>
