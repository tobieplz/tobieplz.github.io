<script setup lang="ts">
/**
 * A simple index under a row of column headings: number, optional date or
 * label, name, and what it was.
 *
 * Given `more`, the list folds. Closed, it shows its first rows, and under
 * them a plus with the number of rows it leaves out. Open, the same button is
 * a minus under the last row.
 */
import { computed, ref, useId, useTemplateRef, watch } from 'vue'

import { useStepped } from '@/composables/useStepped'
import RichText from './RichText.vue'
import type { PlainColumns, PlainRow } from './types'

/** How many rows of a list that folds show while it is closed. */
const PREVIEW = 3

const { rows, more } = defineProps<{
  columns: PlainColumns
  rows: readonly PlainRow[]
  /**
   * Makes the list fold. Given how many rows are folded away, it names the
   * button that shows them.
   */
  more?: (count: number) => string
}>()

const listId = useId()
const button = useTemplateRef('button')

/** How many rows are folded away while the list is closed. A list with none of them does not fold. */
const extra = computed(() => (more === undefined ? 0 : Math.max(0, rows.length - PREVIEW)))
const open = ref(false)
/** How many rows show. It gets to its number a row at a time, so the rows come and go one by one. */
const { count: shown, stepTo } = useStepped(rows.length - extra.value)

/**
 * Opening leaves the page where it is: the rows come out from where the
 * button was, and push it down to under the last of them.
 *
 * Closing takes rows away from over the button. Each time one goes, the page
 * is scrolled back by as much as that moved the button, which keeps the
 * button under the pointer. A button that is off screen, as it can be for
 * someone using the keyboard, is left to come back into view instead.
 */
let heldAt: number | undefined

function toggle(): void {
  open.value = !open.value
  heldAt = open.value ? undefined : topOnScreen(button.value)
  stepTo(open.value ? rows.length : rows.length - extra.value)
}

watch(
  shown,
  () => {
    if (heldAt === undefined || !button.value) return

    // The page has no smooth scrolling, so this is there at once. Naming a
    // behaviour would say so, but not every browser knows the word for it.
    const moved = button.value.getBoundingClientRect().top - heldAt
    if (moved !== 0) window.scrollBy(0, moved)
  },
  { flush: 'post' },
)

/** How far down the screen an element is, or nothing when no part of it is on the screen. */
function topOnScreen(element: Element | null): number | undefined {
  if (!element) return undefined

  const { top, bottom } = element.getBoundingClientRect()
  return bottom > 0 && top < window.innerHeight ? top : undefined
}
</script>

<template>
  <div class="index" :class="{ 'index--folds': extra > 0 }">
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
    <ol :id="listId" class="index__list" role="list">
      <li
        v-for="(row, position) in rows"
        :key="row.no"
        class="index__row"
        :hidden="position >= shown"
      >
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

    <!-- After the rows, so that it is always under the last one that shows. -->
    <div v-if="more !== undefined && extra > 0" class="index__fold">
      <button
        ref="button"
        type="button"
        class="index__toggle index__fold-button"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-label="more(extra)"
        @click="toggle"
      >
        {{ extra }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.index__list > :last-child {
  border-bottom: var(--rule) solid var(--ink);
}

/* The class sets a display of its own, which would otherwise show a row that is folded away. */
.index__row[hidden] {
  display: none;
}

/*
 * A list that folds ends with the button that opens and closes it. The rule
 * over the button is the one that ends the list, under the last row that shows.
 */
.index--folds .index__list > :last-child {
  border-bottom: 0;
}

.index__fold {
  display: flex;
  grid-column: 1 / -1;
  padding-top: var(--space-3);
  border-top: var(--rule) solid var(--ink);
}

/*
 * The sign, and after it the number of rows it stands for. The button is as
 * tall as the ones on the project rows and starts at the edge of the list,
 * with the same space on both sides of the sign and after the number. Only
 * the sign's own height takes up room, which leaves the space under the
 * button the same as under any list.
 */
.index__fold-button {
  --around: calc((2rem - var(--sign)) / 2);

  width: auto;
  margin-block: calc(-1 * var(--around));
  padding-inline: 2rem var(--around);
  font-weight: 500;
}

.index__fold-button::before,
.index__fold-button::after {
  left: 1rem;
}

@media (hover: hover) {
  .index__fold-button:hover {
    background: var(--ink);
    color: var(--paper);
  }

  .index__fold-button:hover::before,
  .index__fold-button:hover::after {
    background: var(--paper);
  }
}

/* Stacked, an empty cell would leave a blank line. */
@media screen and (width < 56rem) {
  .index__when:empty {
    display: none;
  }
}

/*
 * Paper cannot be clicked, and neither can a page without JavaScript. There
 * the list is shown whole, without the button, and its last row ends it like
 * the last row of any list.
 */
@media print, (scripting: none) {
  .index__row[hidden] {
    display: grid;
  }

  .index__fold {
    display: none;
  }

  .index--folds .index__list > :last-child {
    border-bottom: var(--rule) solid var(--ink);
  }
}
</style>
