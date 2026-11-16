<script setup lang="ts">
import { useContent } from '@/content/context'
import { site } from '@/content/site'

const { footer } = useContent()

function print(): void {
  window.print()
}
</script>

<template>
  <footer class="footer label">
    <ul class="footer__actions">
      <li v-if="site.repository" class="row-baseline">
        <a :href="site.repository">{{ footer.source }}</a>
      </li>
      <li class="row-baseline">
        <button type="button" class="footer__print" @click="print">{{ footer.print }}</button>
      </li>
    </ul>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-4) var(--gutter) var(--section-space);
  border-top: var(--rule-heavy) solid var(--ink);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.footer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}

.footer__print {
  letter-spacing: inherit;
  text-decoration: underline var(--rule);
  text-transform: inherit;
  text-underline-offset: 0.2em;
}

@media (hover: hover) {
  .footer__print:hover {
    background: var(--ink);
    color: var(--paper);
    text-decoration-line: none;
  }
}

/* Where a section's label stands at this width. */
@media (width >= 72rem) {
  .footer {
    padding-top: calc(var(--space-4) + var(--space-3) + var(--rule));
  }
}

/* Nothing in it is of use on paper. */
@media print {
  .footer {
    display: none;
  }
}
</style>
