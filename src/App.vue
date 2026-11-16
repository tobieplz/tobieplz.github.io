<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

import { useVault } from '@/vault/vault'

const vault = useVault()

// After hydration, so the prerendered (locked) markup matches the first client render.
onMounted(() => vault.resume())
</script>

<template>
  <RouterView />
</template>
