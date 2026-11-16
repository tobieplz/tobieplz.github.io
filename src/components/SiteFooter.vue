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
    <p class="footer__colophon">{{ footer.colophon }}</p>
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
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-7);
  justify-content: space-between;
  padding: var(--space-5) var(--gutter) var(--space-7);
  border-top: var(--rule-heavy) solid var(--ink);
  color: var(--quiet);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.footer__colophon {
  max-width: 68ch;
}

.footer__actions {
  display: flex;
  gap: var(--space-5);
  color: var(--ink);
  white-space: nowrap;
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

@media print {
  .footer__actions {
    display: none;
  }
}
</style>
