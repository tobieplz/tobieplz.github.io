<script setup lang="ts">
/**
 * Navigation and the name. On the index the name is a poster-sized <h1>; on
 * other pages it shrinks to a one-line link home and the page brings its own <h1>.
 */
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useContent } from '@/content/context'
import { site } from '@/content/site'
import { routeName } from '@/paths'
import LanguageSwitch from './LanguageSwitch.vue'
import ThemeToggle from './ThemeToggle.vue'

const content = useContent()
const route = useRoute()

const isIndex = computed(() => route.meta.page === 'index')
const indexRoute = { name: routeName(content.locale, 'index') }
const aboutRoute = { name: routeName(content.locale, 'about') }
</script>

<template>
  <header class="masthead" :class="{ 'masthead--poster': isIndex }">
    <nav class="masthead__nav label" :aria-label="content.nav.label">
      <ul class="masthead__links">
        <li>
          <RouterLink :to="indexRoute">{{ content.nav.index }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="aboutRoute">{{ content.nav.about }}</RouterLink>
        </li>
      </ul>
      <div class="masthead__tools">
        <LanguageSwitch />
        <ThemeToggle />
      </div>
    </nav>

    <h1 v-if="isIndex" class="wordmark">
      <span>{{ site.givenName }}</span> <span>{{ site.familyName }}</span>
    </h1>
    <p v-else class="wordmark">
      <RouterLink :to="indexRoute">{{ site.name }}</RouterLink>
    </p>

    <p class="masthead__title label">
      <span>{{ content.title }}</span>
      <span class="masthead__rule" aria-hidden="true"></span>
      <span>{{ content.tagline }}</span>
    </p>
  </header>
</template>

<style scoped>
.masthead {
  padding: var(--space-4) var(--gutter) 0;
  container-type: inline-size;
}

.masthead__nav,
.masthead__links,
.masthead__tools {
  display: flex;
  align-items: center;
}

.masthead__nav {
  justify-content: space-between;
  gap: var(--space-5);
}

.masthead__links {
  gap: var(--space-5);
}

.masthead__tools {
  gap: var(--space-5);
}

.masthead__links [aria-current='page'] {
  font-weight: 800;
  text-decoration-thickness: 4px;
}

.wordmark {
  margin-block: var(--space-6) var(--space-4);
  font-size: clamp(2rem, 7.5cqi, 5rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.wordmark a {
  text-decoration-line: none;
}

/* Sized off the container so the longer of the two words always spans the page. */
.masthead--poster .wordmark {
  margin-block: var(--space-5) var(--space-3);
  font-size: 20.4cqi;
  /* Just enough room for the dots on the Ö to clear the line above. */
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.masthead--poster .wordmark span {
  display: block;
}

.masthead__title {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  padding-block: var(--space-3) var(--space-5);
}

.masthead__rule {
  flex: 1;
  min-width: var(--space-5);
  height: var(--rule);
  background: var(--ink);
}

/* Too narrow for title, rule and tagline on one line: stack the two texts instead. */
@container (width < 36rem) {
  .masthead__title {
    flex-direction: column;
    gap: 0;
    align-items: flex-start;
  }

  .masthead__rule {
    display: none;
  }

  .masthead__title span:last-child {
    color: var(--quiet);
  }
}

@media print {
  .masthead {
    padding-top: 0;
  }

  .masthead__nav {
    display: none;
  }

  /* On paper the name is a heading, not a poster. */
  .masthead--poster .wordmark {
    margin-block: 0 var(--space-2);
    font-size: 44pt;
    line-height: 1;
  }

  .masthead--poster .wordmark span {
    display: inline;
  }
}
</style>
