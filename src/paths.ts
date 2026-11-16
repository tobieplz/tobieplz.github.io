import type { Locale } from '@/content/schema'

/**
 * Where the page lives in each language. Kept apart from the route table so
 * that components can link to it without importing what the routes point at.
 */

export const LOCALES: readonly Locale[] = ['en', 'sv']

/** The paths end in a slash because GitHub Pages serves each page as a folder. */
export const PATHS: Readonly<Record<Locale, string>> = { en: '/', sv: '/sv/' }

/** Prerendered to 404.html, which GitHub Pages serves for every unknown address. */
export const NOT_FOUND_PATH = '/404/'
export const NOT_FOUND_ROUTE = 'not-found'
