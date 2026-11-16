<script setup lang="ts">
/** The main table: one line per project, which opens to show the write-up. */
import { reactive, useId } from 'vue'

import { useContent } from '@/content/context'
import type { Project } from '@/content/schema'
import { dotted, numbered } from '@/content/text'
import { slotNumber } from '@/vault/names'
import RedactedName from './RedactedName.vue'
import RichText from './RichText.vue'

defineProps<{ projects: readonly Project[] }>()

const content = useContent()
const { columns, work } = content.index
const baseId = useId()
/** The rows that are open, by their position in the table. */
const open = reactive(new Set<number>())

function toggle(row: number): void {
  if (!open.delete(row)) open.add(row)
}

/**
 * The whole line opens the project for mouse and touch. The button at its end
 * is the real control, for keyboards and screen readers.
 */
function onLineClick(event: MouseEvent, row: number): void {
  const target = event.target
  if (target instanceof Element && target.closest('a, button, input')) return
  // Someone dragging to select text is not asking to open the row.
  if (window.getSelection()?.toString()) return
  toggle(row)
}

/** What a row shows for its client: the label of its redacted cell, or the name when that is public. */
function clientLabel({ client }: Project): string {
  return typeof client === 'string' ? `${content.vault.client} ${slotNumber(client)}` : client.name
}
</script>

<template>
  <div class="index">
    <div class="index__row index__head work__head" aria-hidden="true">
      <span class="index__no row-baseline">{{ columns.number }}</span>
      <span class="index__when">{{ columns.years }}</span>
      <span class="work__client">{{ columns.client }}</span>
      <span class="work__role">{{ columns.role }}</span>
      <span class="work__stack">{{ columns.stack }}</span>
    </div>

    <!-- role="list" because Safari drops list semantics once list-style is none. -->
    <ol class="work__list" role="list">
      <li v-for="(project, row) in projects" :key="row" class="work__item">
        <div class="index__row work__line" @click="onLineClick($event, row)">
          <span class="index__no" aria-hidden="true">{{ numbered(row) }}</span>
          <span class="index__when">
            <span class="visually-hidden">{{ columns.years }}: </span>{{ project.years }}
          </span>
          <span class="work__client">
            <span class="index__who">
              <RedactedName v-if="typeof project.client === 'string'" :slot-id="project.client" />
              <template v-else>{{ project.client.name }}</template>
            </span>
            <span class="work__sector">{{ project.sector }}</span>
          </span>
          <span class="work__role">
            <span class="visually-hidden">{{ columns.role }}: </span>{{ project.role }}
          </span>
          <span class="work__stack">
            <span class="visually-hidden">{{ columns.stack }}: </span>{{ dotted(project.stack) }}
          </span>
          <button
            type="button"
            class="work__toggle"
            :aria-expanded="open.has(row)"
            :aria-controls="`${baseId}-${row}`"
            :aria-label="work.details(clientLabel(project))"
            @click="toggle(row)"
          ></button>
        </div>

        <div :id="`${baseId}-${row}`" class="work__details prose" :hidden="!open.has(row)">
          <p v-for="(paragraph, index) in project.story" :key="index">
            <RichText :text="paragraph" />
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.work__list,
.work__item {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
}

.work__list {
  border-bottom: var(--rule) solid var(--ink);
}

.work__line {
  cursor: pointer;
}

@media (hover: hover) {
  /* Paper and ink trade places, and the redacted cell inside flips with them. */
  .work__line:hover {
    --paper: var(--color-ink);
    --ink: var(--color-paper);
    --quiet: var(--color-quiet-inverse);

    background: var(--paper);
    color: var(--ink);
  }
}

.work__client {
  display: flex;
  flex-direction: column;
  grid-column: who;
  gap: var(--space-1);
  align-items: flex-start;
}

.work__sector {
  color: var(--quiet);
}

.work__role {
  grid-column: role;
}

.work__stack {
  grid-column: stack;
}

.work__toggle {
  position: relative;
  grid-column: toggle;
  align-self: center;
  justify-self: end;
  width: 2rem;
  height: 2rem;
}

/* A plus drawn from two bars; the upright one goes when the row is open. */
.work__toggle::before,
.work__toggle::after {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 0.875rem;
  height: var(--rule);
  background: var(--ink);
  content: '';
  translate: -50% -50%;
}

.work__toggle::after {
  rotate: 90deg;
}

.work__toggle[aria-expanded='true']::after {
  display: none;
}

.work__details {
  grid-column: who / end;
  padding-block: var(--space-2) var(--space-6);
}

/* Without JavaScript the rows cannot be opened, so show every write-up. */
@media (scripting: none) {
  .work__details[hidden] {
    display: block;
  }

  .work__toggle {
    display: none;
  }
}

@media screen and (width < 56rem) {
  .work__line {
    position: relative;
    row-gap: var(--space-1);
  }

  /* Out of the grid flow, so its height does not stretch the first line of the row. */
  .work__toggle {
    position: absolute;
    top: var(--space-1);
    right: 0;
  }
}

@media print {
  .work__toggle {
    display: none;
  }

  /* Paper cannot be clicked, so every write-up is printed. */
  .work__details[hidden] {
    display: block;
  }

  /*
   * On screen the table is one grid, and every line is a subgrid of it. On
   * paper a write-up has to be able to run on to the next page, and a grid
   * nested in a grid does not break across pages reliably. So here the table
   * is plain blocks, and each line lays out its own copy of the same columns.
   */
  .index,
  .work__list,
  .work__item {
    display: block;
  }

  .work__head,
  .work__line {
    grid-template-columns: var(--index-columns);
    column-gap: var(--index-gap);
  }

  /* A project's line stays with the start of its write-up. */
  .work__line {
    break-after: avoid;
  }

  /* The font of the lines above, so that `ch` measures the same columns here as there. */
  .work__details {
    max-width: none;
    margin-left: calc(16ch + 2 * var(--index-gap));
    padding-block: 0 var(--space-2);
    font: inherit;
  }

  .work__details p {
    max-width: var(--measure);
    font-family: var(--font-sans);
    font-size: var(--text-md);
    line-height: 1.42;
    orphans: 2;
    widows: 2;
  }
}
</style>
