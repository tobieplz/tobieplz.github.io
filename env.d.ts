/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute URL the site is served from, without a trailing slash. Set by the deploy workflow. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
