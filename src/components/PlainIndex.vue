<script setup lang="ts">
/**
 * A simple index under a row of column headings: number, optional date or
 * label, name, and what it was. A `collapsible` one starts closed, as a single
 * row under the headings that opens the list when it is pressed.
 */
import { ref, useId } from 'vue'

import RichText from './RichText.vue'
import type { PlainColumns, PlainRow, PlainToggle } from './types'

const { collapsible } = defineProps<{
  columns: PlainColumns
  rows: readonly PlainRow[]
  collapsible?: PlainToggle
}>()

const listId = useId()
const open = ref(collapsible === undefined)

function toggle(): void {
  open.value = !open.value
}

/**
 * The whole row opens the list for mouse and touch. The button at its end is
 * the real control, for keyboards and screen readers.
 */
function onRowClick(event: MouseEvent): void {
  const target = event.target
  if (target instanceof Element && target.closest('button')) return
  toggle()
}
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

    <div
      v-if="collapsible"
      class="index__row index__row--action index__more"
      :class="{ 'index__more--closed': !open }"
      @click="onRowClick"
    >
      <!-- The button carries the same words as its name, so they are not read out twice. -->
      <span
        class="index__more-text label"
        :class="{ 'index__more-text--from-when': columns.when === undefined }"
        aria-hidden="true"
      >
        {{ open ? collapsible.hide : collapsible.show }}
      </span>
      <button
        type="button"
        class="index__toggle index__more-toggle"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-label="open ? collapsible.hide : collapsible.show"
        @click="toggle"
      ></button>
    </div>

    <!-- role="list" because Safari drops list semantics once list-style is none. -->
    <ol :id="listId" class="index__list" role="list" :hidden="!open">
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

/* The class sets a display of its own, which would otherwise show a list that is closed. */
.index__list[hidden] {
  display: none;
}

/*
 * The row that opens and closes the list says so where the names are. Its one
 * line of text sits in the middle of the row, level with the plus at the end.
 */
.index__more-text {
  grid-column: who / toggle;
  align-self: center;
  font-weight: 700;
}

.index__more-text--from-when {
  grid-column: when / toggle;
}

/* Closed, that row is the last one, and ends the list with a rule the way a last row does. */
.index__more--closed {
  border-bottom: var(--rule) solid var(--ink);
}

/* The button is taller than a line of text. Pulled in, it leaves the row as tall as the others. */
.index__more-toggle {
  margin-block: calc(-1 * var(--space-1));
}

/* Stacked, an empty cell would leave a blank line. */
@media screen and (width < 56rem) {
  .index__when:empty {
    display: none;
  }
}

/* Without JavaScript the list cannot be opened, so it is shown open and the row is left out. */
@media (scripting: none) {
  .index__list[hidden] {
    display: grid;
  }

  .index__more {
    display: none;
  }
}

/* Paper cannot be clicked either. */
@media print {
  .index__list[hidden] {
    display: grid;
  }

  .index__more {
    display: none;
  }
}
</style>
