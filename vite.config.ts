/// <reference types="vite-ssg" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ isPreview }) => ({
  // GitHub Pages serves a project site from /<repo>/; the deploy workflow passes that in.
  base: process.env.BASE_PATH ?? '/',
  // `vite preview` serves the prerendered pages as files, the way GitHub Pages does, instead
  // of answering every address with index.html. (It has no equivalent of 404.html, though.)
  appType: isPreview ? 'mpa' : 'spa',
  plugins: [vue()],
  define: {
    // Everything here uses the Composition API, so leave the Options API runtime out of the bundle.
    __VUE_OPTIONS_API__: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Keep images as files. Inlined, a small one would travel inside the JavaScript bundle.
    assetsInlineLimit: 0,
  },
  server: {
    fs: {
      // Vite's defaults, plus the folder holding the unencrypted names.
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem,key,p12,pfx,cer,der}',
        '.npmrc',
        '.yarnrc.yml',
        '**/.git/**',
        '**/private/**',
      ],
    },
  },
  ssgOptions: {
    // /sv/ -> sv/index.html, so the address works with and without a trailing slash.
    dirStyle: 'nested',
    // GitHub Pages looks for /404.html at the site root.
    htmlFileName: (filename) => (filename === '404/index.html' ? '404.html' : undefined),
    // The CSS each page needs to paint is inlined into it. Load the full stylesheets
    // without blocking that first paint.
    beastiesOptions: { preload: 'media' },
  },
}))
