<script setup lang="ts">
/**
 * Flips between light and dark. The choice is remembered and applied by a
 * small inline script in index.html before first paint; until someone uses
 * this, the page follows the system setting.
 */
import { useContent } from '@/content/context'

const { nav } = useContent()

function invert(): void {
  const root = document.documentElement
  const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const current = root.dataset.theme ?? (systemIsDark ? 'dark' : 'light')
  const next = current === 'dark' ? 'light' : 'dark'

  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {
    // Storage can be blocked. The choice then lasts until the page is reloaded.
  }
}
</script>

<template>
  <button type="button" class="toggle" :aria-label="nav.invert" :title="nav.invert" @click="invert">
    <span class="toggle__mark" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.toggle {
  display: grid;
  place-items: center;
  /* A comfortable touch target around a small mark. */
  width: 2rem;
  height: 2rem;
  margin: -0.5rem;
}

.toggle__mark {
  width: 1rem;
  height: 1rem;
  border: var(--rule) solid var(--ink);
  background: linear-gradient(to right, var(--ink) 50%, transparent 50%);
}

@media (hover: hover) {
  .toggle:hover .toggle__mark {
    background: linear-gradient(to right, transparent 50%, var(--ink) 50%);
  }
}
</style>
