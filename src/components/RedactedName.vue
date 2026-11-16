<script setup lang="ts">
/**
 * One hidden company name. It is three things in turn:
 *
 *   locked    a black cell labelled "Client 03"; a button
 *   entering  the same cell as a text field, for typing the passphrase into
 *   unlocked  the real name, decoded out of noise the first time it appears
 */
import { computed, nextTick, onScopeDispose, ref, useId, useTemplateRef, watch } from 'vue'

import { useScramble } from '@/composables/useScramble'
import { useContent } from '@/content/context'
import { slotKind, slotNumber, type NameVariant, type Slot } from '@/vault/names'
import { useVault } from '@/vault/vault'

/** After this long without a keystroke the page quietly tries what has been typed. */
const QUIET_ATTEMPT_MS = 600
const DENIED_SHAKE_MS = 400
/** How long the reveal takes to travel from the top of the screen to the bottom. */
const WAVE_MS = 700

const { slotId, variant = 'name' } = defineProps<{ slotId: Slot; variant?: NameVariant }>()

const vault = useVault()
const { vault: copy } = useContent()
const scramble = useScramble()
const fieldId = useId()

const root = useTemplateRef<HTMLElement>('root')
const draft = ref('')
const shaking = ref(false)
/** Set when this cell should keep keyboard focus after it stops being the field. */
const keepFocus = ref(false)

let quietTimer: ReturnType<typeof setTimeout> | undefined
let shakeTimer: ReturnType<typeof setTimeout> | undefined

const label = computed(() => `${copy[slotKind(slotId)]} ${slotNumber(slotId)}`)
const name = computed(() => {
  const entry = vault.names.value?.[slotId]
  return entry ? (entry[variant] ?? entry.name) : null
})
const isField = computed(() => vault.activeField.value === fieldId)
const isChecking = computed(() => vault.phase.value === 'checking')

function begin(): void {
  vault.begin(fieldId)
}

function onInput(): void {
  vault.keystroke()
  clearTimeout(quietTimer)
  quietTimer = setTimeout(() => vault.attempt(draft.value, { quiet: true }), QUIET_ATTEMPT_MS)
}

function submit(): void {
  clearTimeout(quietTimer)
  void vault.attempt(draft.value)
}

function cancel(): void {
  keepFocus.value = true
  vault.cancel()
}

function onBlur(event: FocusEvent): void {
  // Switching to another window (to copy the passphrase, say) blurs the field
  // but leaves it the active element. Only focus moving elsewhere on the page cancels.
  if (document.activeElement === event.target) return
  // Opening the vault removes the field, which also blurs it.
  if (vault.phase.value !== 'unlocked') vault.cancel()
}

/** Where this cell sits on screen decides when the wave reaches it. Off screen, it is skipped. */
function waveDelay(element: HTMLElement): number | null {
  const { top, bottom } = element.getBoundingClientRect()
  if (bottom < 0 || top > window.innerHeight) return null
  return (top / window.innerHeight) * WAVE_MS
}

watch(isField, async (active, wasActive) => {
  if (active) {
    keepFocus.value = false
    await nextTick()
    root.value?.querySelector('input')?.focus()
    return
  }
  if (!wasActive) return

  clearTimeout(quietTimer)
  draft.value = ''
  if (keepFocus.value || vault.phase.value === 'unlocked') {
    keepFocus.value = true
    await nextTick()
    root.value?.focus({ preventScroll: true })
  }
})

watch(
  () => vault.phase.value,
  (phase) => {
    if (phase === 'checking') {
      if (!isField.value) scramble.churn(label.value)
      return
    }
    if (phase === 'unlocked' && name.value && root.value && vault.revealStyle.value === 'wave') {
      const delay = waveDelay(root.value)
      if (delay !== null) {
        scramble.resolve(name.value, delay)
        return
      }
    }
    scramble.stop()
  },
)

watch(
  () => vault.pulse.value,
  () => {
    if (!name.value && !isField.value) scramble.flash(label.value)
  },
)

watch(
  () => vault.denials.value,
  () => {
    if (!isField.value) return
    shaking.value = true
    clearTimeout(shakeTimer)
    shakeTimer = setTimeout(() => (shaking.value = false), DENIED_SHAKE_MS)
  },
)

onScopeDispose(() => {
  clearTimeout(quietTimer)
  clearTimeout(shakeTimer)
})
</script>

<template>
  <!-- One element for the whole reveal, so keyboard focus survives the noise settling. -->
  <span
    v-if="name"
    ref="root"
    :class="scramble.frame.value ? 'cell' : 'name'"
    :tabindex="keepFocus ? -1 : undefined"
  >
    <template v-if="scramble.frame.value">
      <span class="visually-hidden">{{ name }}</span>
      <span aria-hidden="true">{{ scramble.frame.value }}</span>
    </template>
    <template v-else>{{ name }}</template>
  </span>

  <span v-else-if="isField" ref="root" class="cell cell--field" :class="{ 'is-denied': shaking }">
    <input
      v-model="draft"
      class="cell__input"
      type="text"
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="go"
      :aria-label="copy.passphrase"
      :placeholder="copy.passphrase"
      :readonly="isChecking"
      @input="onInput"
      @keydown.enter.prevent="submit"
      @keydown.esc="cancel"
      @blur="onBlur"
    />
  </span>

  <button
    v-else
    ref="root"
    type="button"
    class="cell cell--button"
    :aria-label="copy.hiddenName(label)"
    @click="begin"
  >
    <span aria-hidden="true">{{ scramble.frame.value ?? label }}</span>
  </button>
</template>

<style scoped>
.cell {
  display: inline-block;
  max-width: 100%;
  padding: 0.1em 0.55em;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.5;
  text-transform: uppercase;
  white-space: nowrap;
  vertical-align: baseline;
}

.cell--button {
  cursor: text;
}

@media (hover: hover) {
  .cell--button:hover {
    outline: 3px solid var(--accent);
  }
}

.cell--field {
  inline-size: min(100%, 26ch);
  padding: 0;
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.cell__input {
  display: block;
  inline-size: 100%;
  padding: 0.1em 0.55em;
  border: 0;
  border-radius: 0;
  outline: 0;
  background: none;
  caret-color: var(--accent);
  letter-spacing: 0.2em;
  /* Typed characters show as blocks, without the field being a password field
     that browsers would offer to save. Not standardised, but in every engine. */
  -webkit-text-security: square;
}

.cell__input::placeholder {
  color: var(--paper);
  letter-spacing: 0.06em;
  opacity: 0.55;
  -webkit-text-security: none;
}

.name {
  font-weight: 700;
  /* A revealed name wraps like any other words, even where it is held to the punctuation after it. */
  white-space: normal;
}

.name:focus {
  outline: 0;
}

.is-denied {
  animation: denied 0.35s steps(6, end);
}

@keyframes denied {
  0%,
  100% {
    translate: 0;
  }
  20%,
  60% {
    translate: -4px;
  }
  40%,
  80% {
    translate: 4px;
  }
}

/* iOS zooms the page when a field under 16px takes focus. */
@media (pointer: coarse) {
  .cell {
    font-size: 1rem;
  }
}

/* Browsers skip backgrounds when printing unless told not to; a redacted cell is its background. */
@media print {
  .cell {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
