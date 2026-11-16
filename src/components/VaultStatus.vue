<script setup lang="ts">
/** The bar across the top: says how many names are hidden and what the vault is doing. */
import { computed, onScopeDispose, ref, watch } from 'vue'

import { useContent } from '@/content/context'
import { SLOTS } from '@/vault/names'
import { useVault } from '@/vault/vault'

type State = 'unsupported' | 'locked' | 'entering' | 'checking' | 'denied' | 'unlocked'

const DENIED_MS = 2500

const vault = useVault()
const { vault: copy } = useContent()
const count = SLOTS.length

const denied = ref(false)
let deniedTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => vault.denials.value,
  () => {
    denied.value = true
    clearTimeout(deniedTimer)
    deniedTimer = setTimeout(() => (denied.value = false), DENIED_MS)
  },
)
onScopeDispose(() => clearTimeout(deniedTimer))

const state = computed<State>(() => {
  if (!vault.supported.value) return 'unsupported'
  if (vault.phase.value === 'unlocked') return 'unlocked'
  if (vault.phase.value === 'checking') return 'checking'
  if (denied.value) return 'denied'
  return vault.activeField.value ? 'entering' : 'locked'
})

const message = computed(() => {
  const messages: Record<State, string> = {
    unsupported: copy.unavailable,
    locked: `${copy.withheld(count)}. ${copy.hint}`,
    entering: copy.entering,
    checking: `${copy.checking}…`,
    denied: copy.denied,
    unlocked: copy.declassified(count),
  }
  return messages[state.value]
})
</script>

<template>
  <div class="status label" :class="{ inverted: state !== 'unlocked' }" :data-state="state">
    <span class="status__lamp" aria-hidden="true"></span>
    <p class="status__message" role="status">{{ message }}</p>
    <button v-if="state === 'unlocked'" type="button" class="status__lock" @click="vault.lock()">
      {{ copy.lock }}
    </button>
  </div>
</template>

<style scoped>
.status {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: var(--space-3);
  align-items: center;
  min-height: 2.25rem;
  padding: var(--space-2) var(--gutter);
  border-bottom: var(--rule) solid var(--color-ink);
  background: var(--paper);
  font-size: var(--text-xs);
  line-height: 1.35;
}

.status__lamp {
  flex: none;
  width: 0.75em;
  height: 0.75em;
  background: var(--ink);
}

[data-state='entering'] .status__lamp,
[data-state='checking'] .status__lamp {
  background: var(--accent);
  animation: blink 1s steps(2, jump-none) infinite;
}

[data-state='denied'] .status__lamp {
  background: var(--accent);
}

[data-state='unlocked'] .status__lamp {
  background: none;
  box-shadow: inset 0 0 0 var(--rule) var(--ink);
}

.status__message {
  flex: 1;
}

.status__lock {
  padding: 0.1em 0.7em;
  box-shadow: inset 0 0 0 var(--rule) var(--ink);
  font-weight: 600;
  letter-spacing: inherit;
  text-transform: inherit;
}

@media (hover: hover) {
  .status__lock:hover {
    background: var(--ink);
    color: var(--paper);
  }
}

@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.15;
  }
}

@media print {
  .status {
    display: none;
  }
}
</style>
