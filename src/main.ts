import { createApp as createClientApp, createSSRApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { NOT_FOUND_PATH } from './paths'
import { routes } from './routes'
import { installVault } from './vault/vault'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/base.css'
import './styles/print.css'

/**
 * The entry vite-ssg builds twice. At build time it calls `createApp()` once
 * per route and renders the result to HTML. In the browser, the block at the
 * bottom of this file hydrates whichever page was served.
 *
 * `import.meta.env.SSR` is a build-time constant, so each of the two bundles
 * keeps only its own branch. That is why this is written out instead of using
 * vite-ssg's `ViteSSG()` helper: the helper ships its head manager to the
 * browser, where the prerendered <head> is already in place.
 */
export async function createApp(routePath?: string) {
  // Production pages arrive prerendered and are hydrated; the dev server has nothing to hydrate.
  const app = import.meta.env.SSR || import.meta.env.PROD ? createSSRApp(App) : createClientApp(App)

  const base = import.meta.env.BASE_URL
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory(base) : createWebHistory(base),
    routes,
    scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  })

  installVault(app)
  app.use(router)

  let head
  if (import.meta.env.SSR) {
    const { createHead } = await import('@unhead/vue/server')
    head = createHead()
    app.use(head)
  }

  // The shape vite-ssg expects back; it navigates to `routePath` itself before rendering.
  return { app, router, routes, head, initialState: {}, routePath }
}

/**
 * Which paths vite-ssg prerenders: every static route, plus the page GitHub
 * Pages serves as 404.html. The catch-all route itself is a pattern, not a path.
 */
export function includedRoutes(paths: string[]): string[] {
  return [...paths.filter((path) => !path.includes(':')), NOT_FOUND_PATH]
}

if (!import.meta.env.SSR) {
  // A promise chain, not top-level await: awaiting here would make every lazy
  // chunk wait on this module, and the bundler splits the shared code into many
  // small files to break that cycle.
  void createApp().then(async ({ app, router }) => {
    // Wait for the route's lazy chunks, so the first client render matches the prerendered markup.
    await router.isReady()
    app.mount('#app')
  })
}
