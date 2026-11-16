<script setup lang="ts">
/**
 * The two switches and the name. On the page the name is a poster-sized <h1>;
 * on the 404 page it shrinks to a one-line link home, and that page brings its own <h1>.
 */
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useContent } from '@/content/context'
import { site } from '@/content/site'
import { NOT_FOUND_ROUTE, PATHS } from '@/paths'
import LanguageSwitch from './LanguageSwitch.vue'
import ThemeToggle from './ThemeToggle.vue'

const content = useContent()
const route = useRoute()

const isPoster = computed(() => route.name !== NOT_FOUND_ROUTE)
</script>

<template>
  <header class="masthead" :class="{ 'masthead--poster': isPoster }">
    <div class="masthead__tools label">
      <LanguageSwitch />
      <ThemeToggle />
    </div>

    <h1 v-if="isPoster" class="wordmark">
      <span>{{ site.givenName }}</span> <span>{{ site.familyName }}</span>
    </h1>
    <p v-else class="wordmark">
      <RouterLink :to="PATHS[content.locale]">{{ site.name }}</RouterLink>
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

.masthead__tools {
  display: flex;
  gap: var(--space-5);
  align-items: center;
  justify-content: flex-end;
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

/*
 * At this width no rule follows the title row on the page, only the intro, and
 * the intro brings the same space above itself as below. So the row adds none.
 */
@media screen and (width >= 72rem) {
  .masthead--poster .masthead__title {
    padding-bottom: 0;
  }
}

@media print {
  .masthead {
    padding-top: 0;
  }

  .masthead__tools {
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
