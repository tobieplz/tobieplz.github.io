<script setup lang="ts">
/** A numbered section: its label down the left, its content to the right. */
import { useId } from 'vue'

defineProps<{ number: string; heading: string; count?: number }>()

const headingId = useId()
</script>

<template>
  <section class="section" :aria-labelledby="headingId">
    <header class="section__head label">
      <span class="section__number" aria-hidden="true">{{ number }}</span>
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
  padding-block: var(--space-4) var(--space-8);
  border-top: var(--rule-heavy) solid var(--ink);
}

.section__head {
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
  /* Lines the label up with the first row of the index beside it. */
  padding-top: var(--space-3);
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
    padding-bottom: var(--space-7);
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
