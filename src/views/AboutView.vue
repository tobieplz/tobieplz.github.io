<script setup lang="ts">
import { RouterLink } from 'vue-router'

import portrait from '@/assets/portrait.webp'
import IndexSection from '@/components/IndexSection.vue'
import PlainIndex from '@/components/PlainIndex.vue'
import RichText from '@/components/RichText.vue'
import type { PlainRow } from '@/components/types'
import { usePageHead } from '@/composables/usePageHead'
import { useContent } from '@/content/context'
import { routeName } from '@/paths'

/** `pnpm portrait` always writes a square, so these only need to state the ratio. */
const PORTRAIT_SIZE = 480

const content = useContent()
const { about } = content

usePageHead('about')

const numbered = (position: number) => String(position + 1).padStart(2, '0')

const factRows: PlainRow[] = about.facts.rows.map((fact, position) => ({
  no: numbered(position),
  when: fact.label,
  who: [fact.value],
}))

const principleRows: PlainRow[] = about.approach.principles.map((principle, position) => ({
  no: numbered(position),
  who: [principle.title],
  what: principle.body,
}))
</script>

<template>
  <article>
    <div class="about">
      <h1 class="about__heading">{{ about.heading }}</h1>
      <img
        class="about__portrait"
        :src="portrait"
        :alt="about.portraitAlt"
        :width="PORTRAIT_SIZE"
        :height="PORTRAIT_SIZE"
        fetchpriority="high"
      />
      <div class="about__bio">
        <p v-for="(paragraph, position) in about.bio" :key="position">
          <RichText :text="paragraph" />
        </p>
        <p class="label">
          <RouterLink :to="{ name: routeName(content.locale, 'index') }">{{
            about.back
          }}</RouterLink>
        </p>
      </div>
    </div>

    <IndexSection number="01" :heading="about.facts.heading">
      <PlainIndex :rows="factRows" />
    </IndexSection>

    <IndexSection number="02" :heading="about.approach.heading">
      <PlainIndex :rows="principleRows" />
    </IndexSection>
  </article>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-6) var(--space-7);
  align-items: start;
  padding-block: var(--space-5) var(--space-8);
  border-top: var(--rule-heavy) solid var(--ink);
}

.about__heading {
  grid-column: 1 / -1;
  font-size: clamp(3.5rem, 2rem + 9vw, 11rem);
  font-weight: 900;
  line-height: 0.86;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.about__portrait {
  width: 22rem;
  border: var(--rule) solid var(--ink);
}

.about__bio {
  display: grid;
  gap: var(--space-4);
  max-width: var(--measure);
}

.about__bio p:first-child {
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.25;
}

@media (width < 56rem) {
  .about {
    grid-template-columns: minmax(0, 1fr);
    padding-bottom: var(--space-7);
  }
}
</style>
