<script setup lang="ts">
/** Links to the page in the other language. Each language is named in itself. */
import { RouterLink } from 'vue-router'

import { useContent } from '@/content/context'
import type { Locale } from '@/content/schema'
import { LOCALES, PATHS } from '@/paths'

const NAMES: Readonly<Record<Locale, string>> = { en: 'English', sv: 'Svenska' }

const content = useContent()
</script>

<template>
  <nav :aria-label="content.nav.language">
    <ul class="languages">
      <li v-for="locale in LOCALES" :key="locale" :lang="locale">
        <span v-if="locale === content.locale" aria-current="true">{{ NAMES[locale] }}</span>
        <RouterLink v-else :to="PATHS[locale]" :hreflang="locale">{{ NAMES[locale] }}</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.languages {
  display: flex;
  gap: var(--space-2);
}

.languages li + li::before {
  margin-right: var(--space-2);
  content: '/';
}

[aria-current] {
  font-weight: 800;
}
</style>
