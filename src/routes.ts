import type { RouteRecordRaw } from 'vue-router'

import { NOT_FOUND_ROUTE, PATHS } from '@/paths'
import IndexView from '@/views/IndexView.vue'

/**
 * Each language has a root route, loaded on demand, that brings that
 * language's copy with it and provides it to the page below.
 */
export const routes: RouteRecordRaw[] = [
  {
    path: PATHS.sv,
    component: () => import('@/locales/SwedishRoot.vue'),
    children: [{ path: PATHS.sv, component: IndexView }],
  },
  {
    path: PATHS.en,
    component: () => import('@/locales/EnglishRoot.vue'),
    children: [
      { path: PATHS.en, component: IndexView },
      {
        path: '/:unknown(.*)*',
        name: NOT_FOUND_ROUTE,
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  },
]
