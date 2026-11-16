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
      <li v-if="site.repository">
        <a :href="site.repository">{{ footer.source }}</a>
      </li>
      <li>
        <button type="button" class="footer__print" @click="print">{{ footer.print }}</button>
      </li>
    </ul>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-5) var(--gutter) var(--space-7);
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

/* Nothing in it is of use on paper. */
@media print {
  .footer {
    display: none;
  }
}
</style>
