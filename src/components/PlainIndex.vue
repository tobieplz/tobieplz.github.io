<script setup lang="ts">
/**
 * A simple index under a row of column headings: number, optional date or
 * label, name, and what it was.
 */
import RichText from './RichText.vue'
import type { PlainColumns, PlainRow } from './types'

defineProps<{ columns: PlainColumns; rows: readonly PlainRow[] }>()
</script>

<template>
  <div class="index">
    <!-- For the eye only. A screen reader gets each heading with the cell it belongs to. -->
    <div class="index__row index__head" aria-hidden="true">
      <span class="index__no row-baseline">{{ columns.no }}</span>
      <span v-if="columns.when !== undefined" class="index__when">{{ columns.when }}</span>
      <span
        class="index__who"
        :class="{
          'index__who--from-when': columns.when === undefined,
          'index__who--to-end': columns.what === undefined,
        }"
      >
        {{ columns.who }}
      </span>
      <span v-if="columns.what !== undefined" class="index__what">{{ columns.what }}</span>
    </div>

    <!-- role="list" because Safari drops list semantics once list-style is none. -->
    <ol class="index__list" role="list">
      <li v-for="row in rows" :key="row.no" class="index__row">
        <span class="index__no" aria-hidden="true">{{ row.no }}</span>
        <span v-if="row.when !== undefined" class="index__when">
          <span v-if="row.when" class="visually-hidden">{{ columns.when }}: </span>{{ row.when }}
        </span>
        <span
          class="index__who"
          :class="{
            'index__who--from-when': row.when === undefined,
            'index__who--to-end': row.what === undefined,
          }"
        >
          <RichText :text="row.who" />
        </span>
        <span v-if="row.what !== undefined" class="index__what">
          <span class="visually-hidden">{{ columns.what }}: </span>{{ row.what }}
        </span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.index__list > :last-child {
  border-bottom: var(--rule) solid var(--ink);
}

/* Stacked, an empty cell would leave a blank line. */
@media screen and (width < 56rem) {
  .index__when:empty {
    display: none;
  }
}
</style>
