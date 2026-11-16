<script setup lang="ts">
/**
 * A simple index under a row of column headings: number, optional date or
 * label, name, and what it was.
 *
 * Inside a section that can be closed, the list shows one row in place of its
 * rows while the section is closed: the numbers it covers, and what is in it.
 */
import { computed } from 'vue'

import { useDisclosure } from './disclosure'
import RichText from './RichText.vue'
import type { PlainColumns, PlainRow } from './types'

const { rows } = defineProps<{
  columns: PlainColumns
  rows: readonly PlainRow[]
  /** What the one row says is in the list, while the section around it is closed. */
  summary?: string
}>()

const section = useDisclosure()
const closed = computed(() => section !== undefined && !section.open.value)

/** The numbers of the first and the last row: "09–21". */
const range = computed(() => {
  const numbers = [rows[0], rows[rows.length - 1]].map((row) => row?.no ?? '')
  return numbers.join('–')
})
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

    <!-- For the pointer only. The heading of the section is the button, and says what it opens. -->
    <div
      v-if="closed"
      class="index__row index__row--action index__folded"
      aria-hidden="true"
      @click="section?.toggle()"
    >
      <span class="index__no index__folded-range">{{ range }}</span>
      <span class="index__who index__folded-summary">{{ summary }}</span>
      <span class="index__toggle index__folded-sign"></span>
    </div>

    <!-- role="list" because Safari drops list semantics once list-style is none. -->
    <ol class="index__list" role="list" :hidden="closed">
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
 * The one row that stands in for the rows of a closed list. It is laid out as
 * one of them: the numbers it covers where a number is, what is in it where a
 * name is, and at the end the plus of a row that opens. It is the last row
 * while it shows, and ends the list with a rule the way a last row does.
 */
.index__folded {
  border-bottom: var(--rule) solid var(--ink);
}

/* Five characters where a number has two, so it borrows the column beside it. */
.index__folded-range {
  grid-column: no / who;
  white-space: nowrap;
}

.index__folded-summary {
  grid-column: who / toggle;
}

/* The sign is taller than a line of text. Pulled in, it leaves the row as tall as the others. */
.index__folded-sign {
  margin-block: calc(-1 * var(--space-1));
}

@media screen and (width < 56rem) {
  /* Stacked, an empty cell would leave a blank line. */
  .index__when:empty {
    display: none;
  }

  /* The numbers go above the words, where a stacked row has its first line. */
  .index__folded-range {
    grid-column: when;
  }

  .index__folded-sign {
    grid-row: 1 / span 2;
  }
}

/* Without JavaScript the list cannot be opened, so it is shown open and the row is left out. */
@media (scripting: none) {
  .index__list[hidden] {
    display: grid;
  }

  .index__folded {
    display: none;
  }
}

/* Paper cannot be clicked either. */
@media print {
  .index__list[hidden] {
    display: grid;
  }

  .index__folded {
    display: none;
  }
}
</style>
