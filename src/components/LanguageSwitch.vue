<script setup lang="ts">
/** Links to the same page in the other language. */
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useContent } from '@/content/context'
import type { Locale } from '@/content/schema'
import { LOCALES, routeName } from '@/paths'

const NAMES: Readonly<Record<Locale, string>> = { en: 'English', sv: 'Svenska' }

const content = useContent()
const route = useRoute()

const page = computed(() => route.meta.page ?? 'index')
</script>

<template>
  <ul class="languages" :aria-label="content.nav.language">
    <li v-for="locale in LOCALES" :key="locale">
      <span v-if="locale === content.locale" aria-current="true">
        <span class="visually-hidden">{{ NAMES[locale] }}</span>
        <span aria-hidden="true">{{ locale }}</span>
      </span>
      <RouterLink v-else :to="{ name: routeName(locale, page) }" :lang="locale" :hreflang="locale">
        <span class="visually-hidden">{{ NAMES[locale] }}</span>
        <span aria-hidden="true">{{ locale }}</span>
      </RouterLink>
    </li>
  </ul>
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
