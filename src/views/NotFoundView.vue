<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { usePageHead } from '@/composables/usePageHead'
import { useContent } from '@/content/context'
import { PATHS } from '@/paths'

const content = useContent()
const { notFound } = content

usePageHead('notFound')
</script>

<template>
  <article class="missing">
    <p class="missing__code label" aria-hidden="true">404</p>
    <h1 class="missing__heading">{{ notFound.heading }}</h1>
    <p>{{ notFound.body }}</p>
    <p class="label">
      <RouterLink :to="PATHS[content.locale]">{{ notFound.back }}</RouterLink>
    </p>
  </article>
</template>

<style scoped>
.missing {
  display: grid;
  gap: var(--space-4);
  padding-block: var(--space-5) var(--section-space);
  border-top: var(--rule-heavy) solid var(--ink);
}

.missing__code {
  color: var(--quiet);
}

.missing__heading {
  font-size: var(--text-xl);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  text-transform: uppercase;
}
</style>
