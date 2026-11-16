<script setup lang="ts">
/**
 * A numbered section: its label down the left, its content to the right.
 * Sections are divided by a heavy rule, unless one is `joined` to the section
 * above it because the two belong together.
 */
import { useId } from 'vue'

defineProps<{ number: string; heading: string; count?: number; joined?: boolean }>()

const headingId = useId()
</script>

<template>
  <section class="section" :class="{ 'section--joined': joined }" :aria-labelledby="headingId">
    <header class="section__head label">
      <span class="section__number row-baseline" aria-hidden="true">{{ number }}</span>
      <h2 :id="headingId" class="section__heading">{{ heading }}</h2>
      <span v-if="count !== undefined" class="section__count" aria-hidden="true">
        ({{ String(count).padStart(2, '0') }})
      </span>
    </header>
    <div class="section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 4fr);
  gap: var(--space-4) var(--index-gap);
  padding-block: var(--space-4) var(--section-space);
  border-top: var(--rule-heavy) solid var(--ink);
}

/*
 * No heavy rule to start under, so the list inside draws its own first line.
 * And no space above it either: the space under the section before is the
 * whole gap, the same as the one that leads up to a heavy rule.
 */
.section--joined {
  --first-rule: var(--ink);

  padding-top: 0;
  border-top: 0;
}

.section__head {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
  /* As far down as the text of the first row beside it: below that row's rule and its padding. */
  padding-top: calc(var(--space-3) + var(--rule));
  font-weight: 800;
}

.section__heading {
  font-weight: inherit;
}

.section__count {
  color: var(--quiet);
  font-weight: 500;
}

@media (width < 72rem) {
  .section {
    grid-template-columns: minmax(0, 1fr);
  }

  .section__head {
    padding-top: 0;
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
}
</style>
