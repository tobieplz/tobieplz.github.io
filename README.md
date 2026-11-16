# Tobias Sjösten: portfolio

A one-page CV and portfolio in English and Swedish, prerendered to static HTML and hosted on GitHub Pages: <https://tobieplz.github.io/>.

The client and employer names are confidential, and the source is public. So every company name on the site is a black cell until someone types the passphrase into one of them. Then the page decrypts in place.

## Stack

| Piece     | Choice                                                    | Why                                                                               |
| --------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Framework | Vue 3, `<script setup>`, strict TypeScript                | Small, typed components                                                           |
| Build     | Vite                                                      | The standard for Vue                                                              |
| Prerender | vite-ssg, Vue Router                                      | Every page is real HTML before any JavaScript runs                                |
| Styling   | Hand-written CSS: tokens, layers, subgrid, `light-dark()` | The design is rules and type; a utility framework would add more than it replaces |
| State     | One vault object, provided per app instance               | There is one piece of state, and nothing is shared between prerender passes       |
| Fonts     | Archivo and JetBrains Mono, self-hosted                   | Two files, no third-party requests                                                |
| Tests     | Vitest, Vue Test Utils                                    | Encryption, the vault's state machine, the redacted cell, language parity         |
| Deploy    | GitHub Actions to GitHub Pages                            | Lint, test, build, publish on every push to `main`                                |

There is no store library, no CSS framework, no i18n library, no analytics and no cookies. The head tags are written at build time, so no head manager ships to the browser either.

## How the names stay hidden

GitHub Pages serves static files, so no server can check a password. The names therefore never exist in readable form in the repository or in the built site.

- `private/names.json` holds the real names, keyed by neutral ids such as `c03` and `e02`. It is gitignored.
- `pnpm seal` encrypts that file with a passphrase into `src/vault/sealed.json`, which is committed. The cipher is AES-256-GCM. The key is derived from the passphrase with PBKDF2-SHA-256 at 600,000 rounds, with a random salt. The payload is padded, so its size says nothing about the names.
- The page only ever refers to the ids. When a visitor types the passphrase, the browser derives the same key and decrypts. A wrong passphrase simply fails to decrypt; no password or hash is stored anywhere.
- `pnpm check:leaks` searches the built site and every file git would track for each private name, and fails if it finds one. It runs after every build and before every commit.

All of it is the browser's built-in Web Crypto. The same module, `src/vault/crypto.ts`, runs in the page and in the Node scripts.

### What this protects against, and what it does not

It keeps the names out of search engines, scrapers and the public repository, and away from anyone who has not been given the passphrase.

The sealed file is public, so anyone can run guesses against it on their own machine for as long as they like. The key derivation makes each guess slow, which is enough for a long passphrase and not enough for a short one. `pnpm seal` refuses passphrases under four words or twenty characters unless told otherwise.

Anyone who has the passphrase can pass it on. While a tab is unlocked, the names are kept in that tab's session storage so that a reload does not lock the page again.

Changing the passphrase does not lock out anyone who had the old one. Every earlier `sealed.json` stays in the git history, and the passphrase it was sealed with still opens it. For the same reason, the real passphrase goes in before the first commit.

## Working on it

Node 22.18 or newer, and pnpm.

```bash
pnpm install
```

| Command             | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `pnpm dev`          | Dev server                                                           |
| `pnpm build`        | Type-checks, prerenders every page into `dist/`, runs the leak check |
| `pnpm preview`      | Serves `dist/`                                                       |
| `pnpm test`         | Unit tests                                                           |
| `pnpm check:lint`   | Oxlint and ESLint                                                    |
| `pnpm check:format` | Prettier                                                             |
| `pnpm seal`         | Encrypts `private/names.json` into `src/vault/sealed.json`           |
| `pnpm unseal`       | Recreates `private/names.json` from the sealed file                  |
| `pnpm check:leaks`  | Fails if a private name is in a public file                          |
| `pnpm portrait`     | Prepares the portrait from `assets-src/portrait.webp`                |
| `pnpm share-image`  | Renders `public/og.png` from `assets-src/share-image.html`           |

## Changing things

**Copy.** Everything a visitor reads is in `src/content/en.ts` and `src/content/sv.ts`. Both implement the same `Content` type, so a field missing from one language is a compile error. Refer to a company by its slot, never by name:

```ts
text`Frontend developer at ${hidden('c03')}.`
```

**Names.** Edit `private/names.json`, then run `pnpm seal`. On a machine that only has the repository, `pnpm unseal` recreates the file first.

**Passphrase.** `pnpm seal` asks for it. To skip the prompt, put `VAULT_PASSPHRASE` in `.env.local` (see `.env.example`). Case and surrounding spaces do not matter when it is typed.

**Secret link.** Adding `#k=` and the passphrase to any page address, for example `https://example.com/#k=four%20words%20like%20these`, opens the page already unlocked and then removes the passphrase from the address bar. The part after `#` is never sent to a server.

**Contact details.** `src/content/site.ts`. An empty value hides that row.

**Photo.** `pnpm portrait path/to/photo.jpg` writes it to `src/assets/` in two sizes for the page to choose between, with the sizes noted beside them. The colours are kept. `assets-src/portrait.trim.json` says how much of the photo to cut from each edge.

## Deploying

1. Push the repository to GitHub.
2. Under Settings, Pages, set the source to GitHub Actions.

Every push to `main` then runs `.github/workflows/deploy.yml`, which lints, tests, builds and publishes. The workflow reads the site's address from the Pages settings, so the same build works at `user.github.io/repository` and on a custom domain.

## Layout

```
src/
  main.ts          app entry, built once for prerendering and once for the browser
  routes.ts        the route table: a root per language, the page below it
  paths.ts         where the page lives in each language
  content/         all copy, plus the schema both languages implement
  vault/           encryption, the slot ids, and the vault's state
  components/      RedactedName is the black cell; the rest is layout
  views/           the page and the 404 page
  styles/          tokens, fonts, base and print styles
scripts/           seal, unseal, leak check, portrait, share image
private/           the real names (gitignored)
```
