<script setup lang="ts">
/** Prose with hidden names in it. */
import { computed } from 'vue'

import type { NameRef, RichText } from '@/content/schema'
import RedactedName from './RedactedName.vue'

/** Punctuation that closes what came before it, and so must never start a line. */
const CLOSING = /^[.,:;!?)\]’”]+/

interface Mention {
  readonly name: NameRef
  /** The punctuation that directly follows the name, if any. */
  readonly closing: string
}

const { text } = defineProps<{ text: RichText }>()

/**
 * A hidden name is a box, and a line may break on either side of a box, which
 * would let the full stop after one drop onto the next line by itself. So the
 * punctuation that follows a name is taken out of the text and kept with it.
 */
const parts = computed(() => {
  const result: (string | Mention)[] = []
  let taken = 0

  for (const [index, segment] of text.entries()) {
    if (typeof segment === 'string') {
      const rest = segment.slice(taken)
      taken = 0
      if (rest) result.push(rest)
      continue
    }

    const next = text[index + 1]
    const closing = typeof next === 'string' ? (CLOSING.exec(next)?.[0] ?? '') : ''
    taken = closing.length
    result.push({ name: segment, closing })
  }

  return result
})
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <template v-if="typeof part === 'string'">{{ part }}</template>
    <span v-else-if="part.closing" class="together">
      <RedactedName :slot-id="part.name.slot" :variant="part.name.variant" />{{ part.closing }}
    </span>
    <RedactedName v-else :slot-id="part.name.slot" :variant="part.name.variant" />
  </template>
</template>

<style scoped>
.together {
  white-space: nowrap;
}
</style>
