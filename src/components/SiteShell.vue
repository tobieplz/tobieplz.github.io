<script setup lang="ts">
/** The frame shared by every page: status bar, header, the page itself, footer. */
import { RouterView } from 'vue-router'

import { useContent } from '@/content/context'
import SiteFooter from './SiteFooter.vue'
import SiteHeader from './SiteHeader.vue'
import VaultStatus from './VaultStatus.vue'

const { nav } = useContent()
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
  translate: 0 -100%;
}

.skip:focus {
  translate: 0;
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
