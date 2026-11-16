<script setup lang="ts">
/** The CV as one numbered index. */
import { RouterLink } from 'vue-router'

import IndexSection from '@/components/IndexSection.vue'
import PlainIndex from '@/components/PlainIndex.vue'
import RichText from '@/components/RichText.vue'
import WorkIndex from '@/components/WorkIndex.vue'
import type { PlainRow } from '@/components/types'
import { usePageHead } from '@/composables/usePageHead'
import { useContent } from '@/content/context'
import { site, type ContactChannel } from '@/content/site'
import { hidden } from '@/content/text'
import { routeName } from '@/paths'
import { slotNumber } from '@/vault/names'

const content = useContent()
const { index } = content

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
    <p class="intro__lead"><RichText :text="index.intro[0] ?? []" /></p>
    <div class="intro__rest">
      <p v-for="(paragraph, position) in index.intro.slice(1)" :key="position">
        <RichText :text="paragraph" />
      </p>
      <p class="intro__more label">
        <RouterLink :to="{ name: routeName(content.locale, 'about') }">{{ index.more }}</RouterLink>
      </p>
    </div>
  </div>

  <IndexSection number="01" :heading="index.work.heading" :count="index.work.projects.length">
    <WorkIndex :projects="index.work.projects" />
  </IndexSection>

  <IndexSection number="02" :heading="index.clients.heading" :count="clientRows.length">
    <PlainIndex :rows="clientRows" />
  </IndexSection>

  <IndexSection number="03" :heading="index.experience.heading" :count="jobRows.length">
    <PlainIndex :rows="jobRows" />
  </IndexSection>

  <IndexSection number="04" :heading="index.toolbox.heading">
    <PlainIndex :rows="skillRows" />
  </IndexSection>

  <IndexSection number="05" :heading="index.education.heading">
    <PlainIndex :rows="courseRows" />
  </IndexSection>

  <IndexSection v-if="channels.length > 0" number="06" :heading="index.contact.heading">
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
  gap: var(--space-5) var(--index-gap);
  padding-block: var(--space-6) var(--space-8);
  border-top: var(--rule-heavy) solid var(--ink);
}

.intro__lead {
  grid-column: 1 / -1;
  max-width: 28ch;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.intro__rest {
  display: grid;
  grid-column: 2;
  gap: var(--space-4);
  max-width: var(--measure);
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

@media (width < 72rem) {
  .intro {
    padding-bottom: var(--space-7);
  }

  .intro__rest {
    grid-column: 1 / -1;
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

@media print {
  .intro {
    padding-block: var(--space-4) var(--space-6);
  }

  .intro__lead {
    max-width: 44ch;
  }

  /* A link to another page is no use on paper. */
  .intro__more {
    display: none;
  }

  .contact__lead {
    break-after: avoid;
  }
}
</style>
