<script setup lang="ts">
/**
 * Top of the Swedish pages. Importing the copy here, and nowhere else, puts it
 * in this component's chunk, so a visitor only ever downloads one language.
 */
import SiteShell from '@/components/SiteShell.vue'
import { provideContent } from '@/content/context'
import { content } from '@/content/sv'

provideContent(content)
</script>

<template>
  <SiteShell />
</template>
