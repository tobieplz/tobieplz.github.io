<script setup lang="ts">
/**
 * A numbered section: its label down the left, its content to the right.
 * Sections are divided by a heavy rule, unless one is `joined` to the section
 * above it because the two belong together. A `collapsible` section starts
 * closed, and its heading is the button that opens it.
 */
import { ref, useId } from 'vue'

const { collapsible = false } = defineProps<{
  number: string
  heading: string
  count?: number
  joined?: boolean
  collapsible?: boolean
}>()

const headingId = useId()
const bodyId = useId()
const open = ref(!collapsible)
</script>

<template>
  <section
    class="section"
    :class="{ 'section--joined': joined, 'section--closed': !open }"
    :aria-labelledby="headingId"
  >
    <header class="section__head label">
      <span class="section__number row-baseline" aria-hidden="true">{{ number }}</span>
      <h2 :id="headingId" class="section__heading">
        <button
          v-if="collapsible"
          type="button"
          class="section__toggle"
          :aria-expanded="open"
          :aria-controls="bodyId"
          @click="open = !open"
        >
          {{ heading }}
        </button>
        <template v-else>{{ heading }}</template>
      </h2>
      <span v-if="count !== undefined" class="section__count" aria-hidden="true">
        ({{ String(count).padStart(2, '0') }})
      </span>
      <span v-if="collapsible" class="section__sign" aria-hidden="true"></span>
    </header>
    <div :id="bodyId" class="section__body" :hidden="!open">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  /*
   * How far below the top of the section's content its label starts, and the
   * first line of text beside it: as far as the text of a row is below its rule.
   */
  --label-offset: calc(var(--space-3) + var(--rule));

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
  gap: var(--space-4) var(--index-gap);
  padding-block: var(--space-4) var(--section-space);
  border-top: var(--rule-heavy) solid var(--ink);
}

/*
 * No heavy rule to start under, and no space above either: the space under
 * the section before is the whole gap, the same as the one that leads up to a
 * heavy rule. So the label and the headings beside it start at the very top.
 */
.section--joined {
  --label-offset: 0px;

  padding-top: 0;
  border-top: 0;
}

/*
 * A line of text has room above and below its letters. Elsewhere the gap
 * between sections ends at a rule, but here it ends at letters. So that room
 * is cut off the top of the label, and of the headings beside it, to keep the
 * gap the same size. A closed section is nothing but its label, so there it
 * is cut off the bottom as well. Print has its own, tighter spacing.
 */
@media screen {
  .section--joined {
    --label-trim: trim-start;
    --label-trim-closed: trim-both;
  }
}

.section__head {
  position: relative;
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
  padding-top: var(--label-offset);
  font-weight: 800;
}

.section__head > * {
  text-box-trim: var(--label-trim, none);
  text-box-edge: cap alphabetic;
}

.section--closed .section__head > * {
  text-box-trim: var(--label-trim-closed, var(--label-trim, none));
}

.section__heading {
  font-weight: inherit;
}

.section__count {
  color: var(--quiet);
  font-weight: 500;
}

/* A button drops these two. The heading inside one should look like any other heading. */
.section__toggle {
  letter-spacing: inherit;
  text-transform: inherit;
}

/* The whole line of the label opens and closes the section, not just the word in it. */
.section__toggle::before {
  position: absolute;
  top: calc(var(--label-offset) - var(--space-3));
  right: 0;
  left: 0;
  height: 2.5rem;
  content: '';
}

/*
 * A plus drawn from two bars; the upright one goes when the section is open.
 * The box is as tall as the capitals beside it and stands on their baseline,
 * which puts the plus level with the middle of them.
 */
.section__sign {
  position: relative;
  width: 0.625rem;
  height: 0.73em;
}

.section__sign::before,
.section__sign::after {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 0.625rem;
  height: var(--rule);
  background: var(--ink);
  content: '';
  translate: -50% -50%;
}

.section__sign::after {
  rotate: 90deg;
}

.section:not(.section--closed) .section__sign::after {
  display: none;
}

@media (hover: hover) {
  .section__toggle:hover {
    background: var(--ink);
    color: var(--paper);
  }
}

@media (width < 72rem) {
  .section {
    grid-template-columns: minmax(0, 1fr);
  }

  .section__head {
    padding-top: 0;
  }

  /*
   * The label has the full width here, so the plus goes to the end of it and
   * takes the size and the place of the ones on the rows: in the middle of
   * their 2rem buttons.
   */
  .section__sign {
    width: 0.875rem;
    margin-inline: auto 0.5625rem;
  }

  .section__sign::before,
  .section__sign::after {
    width: 0.875rem;
  }
}

/* Without JavaScript the section cannot be opened, so it is shown open. */
@media (scripting: none) {
  .section__body[hidden] {
    display: block;
  }

  .section__toggle {
    cursor: auto;
  }

  .section__sign {
    display: none;
  }
}

@media print {
  /* Plain blocks, so the heading can be kept on the same page as what follows it. */
  .section {
    display: block;
    padding-block: var(--space-2);
  }

  .section__head {
    margin-bottom: var(--space-2);
    break-after: avoid;
  }

  /* Paper cannot be clicked, so a closed section is printed open. */
  .section__body[hidden] {
    display: block;
  }

  .section__sign {
    display: none;
  }
}
</style>
