import { useHead } from '@unhead/vue'

import { useContent } from '@/content/context'
import type { Content, Locale, PageId } from '@/content/schema'
import { site } from '@/content/site'
import { LOCALES, PATHS } from '@/paths'

type Page = PageId | 'notFound'

const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
const OPEN_GRAPH_LOCALE: Readonly<Record<Locale, string>> = { en: 'en_GB', sv: 'sv_SE' }

/**
 * Sets up the document head for a page.
 *
 * The whole head is written into the HTML when the site is prerendered, which
 * is where crawlers and link previews read it. In the browser only the two
 * things a visitor can notice, the title and the language, follow client-side
 * navigation. That keeps the head manager out of the browser bundle entirely.
 */
export function usePageHead(page: Page): void {
  const content = useContent()

  if (import.meta.env.SSR) {
    useHead(describe(content, page))
    if (SITE_URL && page !== 'notFound') useHead(locate(content, page, SITE_URL))
    return
  }

  document.title = content.meta[page].title
  document.documentElement.lang = content.locale
}

function describe(content: Content, page: Page) {
  const { title, description } = content.meta[page]

  return {
    title,
    htmlAttrs: { lang: content.locale },
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:locale', content: OPEN_GRAPH_LOCALE[content.locale] },
      ...(page === 'notFound' ? [{ name: 'robots', content: 'noindex' }] : []),
    ],
  }
}

/**
 * Everything that needs the site's absolute address: canonical link, language
 * alternates, share image and structured data. A build that does not know
 * where it will be hosted leaves these out.
 */
function locate(content: Content, page: PageId, siteUrl: string) {
  const addressOf = (locale: Locale) => siteUrl + PATHS[locale][page]
  const address = addressOf(content.locale)
  const { linkedin, github } = site.contact
  const profiles = [linkedin, github && `https://github.com/${github}`].filter(Boolean)

  return {
    meta: [
      { property: 'og:url', content: address },
      { property: 'og:image', content: `${siteUrl}/og.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    link: [
      { rel: 'canonical', href: address },
      ...[...LOCALES, 'x-default' as const].map((language) => ({
        rel: 'alternate' as const,
        hreflang: language,
        href: addressOf(language === 'x-default' ? 'en' : language),
      })),
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: site.name,
          givenName: site.givenName,
          familyName: site.familyName,
          jobTitle: content.title,
          description: content.meta.about.description,
          url: siteUrl + PATHS[content.locale].index,
          ...(profiles.length > 0 && { sameAs: profiles }),
        }),
      },
    ],
  }
}
