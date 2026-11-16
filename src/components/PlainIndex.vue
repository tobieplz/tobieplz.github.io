<script setup lang="ts">
/** A simple index: number, optional date or label, name, and what it was. */
import RichText from './RichText.vue'
import type { PlainRow } from './types'

defineProps<{ rows: readonly PlainRow[] }>()
</script>

<template>
  <!-- role="list" because Safari drops list semantics once list-style is none. -->
  <ol class="index" role="list">
    <li v-for="row in rows" :key="row.no" class="index__row">
      <span class="index__no" aria-hidden="true">{{ row.no }}</span>
      <span v-if="row.when !== undefined" class="index__when">{{ row.when }}</span>
      <span
        class="index__who"
        :class="{
          'index__who--from-when': row.when === undefined,
          'index__who--to-end': row.what === undefined,
        }"
      >
        <RichText :text="row.who" />
      </span>
      <span v-if="row.what !== undefined" class="index__what">{{ row.what }}</span>
    </li>
  </ol>
</template>

<style scoped>
.index__row:last-child {
  border-bottom: var(--rule) solid var(--ink);
}

/*
 * Beside its section label the list starts right under the section's heavy
 * rule, which is line enough. A section without that rule sets --first-rule.
 */
@media (width >= 72rem) {
  .index__row:first-child {
    border-top-color: var(--first-rule, transparent);
  }
}

/* Stacked, an empty cell would leave a blank line. */
@media screen and (width < 56rem) {
  .index__when:empty {
    display: none;
  }
}
</style>
