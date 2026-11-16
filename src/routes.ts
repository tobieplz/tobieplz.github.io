import type { RouteRecordRaw } from 'vue-router'

import type { Locale, PageId } from '@/content/schema'
import { PATHS, routeName } from '@/paths'
import IndexView from '@/views/IndexView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Which page this is, so the language switch can link to its counterpart. */
    page?: PageId
  }
}

function pages(locale: Locale): RouteRecordRaw[] {
  return [
    {
      path: PATHS[locale].index,
      name: routeName(locale, 'index'),
      component: IndexView,
      meta: { page: 'index' },
    },
    {
      path: PATHS[locale].about,
      name: routeName(locale, 'about'),
      component: () => import('@/views/AboutView.vue'),
      meta: { page: 'about' },
    },
  ]
}

/**
 * Each language has a root route, loaded on demand, that brings that
 * language's copy with it and provides it to the pages below.
 */
export const routes: RouteRecordRaw[] = [
  {
    path: PATHS.sv.index,
    component: () => import('@/locales/SwedishRoot.vue'),
    children: pages('sv'),
  },
  {
    path: PATHS.en.index,
    component: () => import('@/locales/EnglishRoot.vue'),
    children: [
      ...pages('en'),
      {
        path: '/:unknown(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  },
]
