<script setup lang="ts">
/** The frame shared by every page: status bar, header, the page itself, footer. */
import { RouterView } from 'vue-router'

import { useTapped } from '@/composables/useTapped'
import { useContent } from '@/content/context'
import SiteFooter from './SiteFooter.vue'
import SiteHeader from './SiteHeader.vue'
import VaultStatus from './VaultStatus.vue'

const { nav } = useContent()

useTapped()
</script>

<template>
  <a class="skip label" href="#content">{{ nav.skip }}</a>
  <VaultStatus />
  <SiteHeader />
  <main id="content" class="page" tabindex="-1">
    <RouterView />
  </main>
  <SiteFooter />
</template>

<style scoped>
.skip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  padding: var(--space-2) var(--space-4);
  background: var(--accent);
  color: #fff;
}

/*
 * Out of sight until the keyboard reaches it. Clipped away, not moved off the
 * top: its height is not a whole number of pixels, so moving it left half a
 * pixel of it showing along the top edge on screens of ordinary density.
 */
.skip:not(:focus) {
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.page {
  padding-inline: var(--gutter);
}

.page:focus {
  outline: 0;
}

@media print {
  .skip {
    display: none;
  }
}
</style>
