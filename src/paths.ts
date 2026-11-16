import type { Locale, PageId } from '@/content/schema'

/**
 * Where every page lives. Kept apart from the route table so that components
 * can link to pages without importing the components the routes point at.
 */

export const LOCALES: readonly Locale[] = ['en', 'sv']

/** Canonical paths. They end in a slash because GitHub Pages serves each page as a folder. */
export const PATHS: Readonly<Record<Locale, Readonly<Record<PageId, string>>>> = {
  en: { index: '/', about: '/about/' },
  sv: { index: '/sv/', about: '/sv/om/' },
}

/** Prerendered to 404.html, which GitHub Pages serves for every unknown address. */
export const NOT_FOUND_PATH = '/404/'

export type PageRouteName = `${Locale}-${PageId}`

export function routeName(locale: Locale, page: PageId): PageRouteName {
  return `${locale}-${page}`
}
