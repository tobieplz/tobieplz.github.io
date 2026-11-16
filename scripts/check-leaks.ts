/**
 * Fails if a private name appears in anything that could become public: the
 * built site, or any file git would track.
 *
 * Runs after every build and from the pre-commit hook. On a machine without
 * private/names.json (CI, a fresh clone) there is nothing to compare against,
 * so it reports that and passes.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

import { parseNames, type Names } from '../src/vault/names.ts'
import { NAMES_PATH, ROOT, relative, run } from './lib.ts'

const BINARY_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.webp',
  '.woff',
  '.woff2',
])
/** Fragments shorter than this are too common to search for on their own. */
const MIN_LENGTH = 3
/** Short names such as three-letter acronyms only count on an exact-case match. */
const IGNORE_CASE_FROM = 5

interface Leak {
  readonly file: string
  readonly line: number
  readonly term: string
}

await run(async () => {
  if (!existsSync(NAMES_PATH)) {
    console.log(`Leak check skipped: ${relative(NAMES_PATH)} is not on this machine.`)
    return
  }

  const patterns = searchTerms(parseNames(JSON.parse(await readFile(NAMES_PATH, 'utf8')))).map(
    (term) => ({ term, pattern: wholeWord(term) }),
  )
  const files = [...publishableFiles(), ...(await builtFiles())]

  const leaks: Leak[] = []
  for (const file of files) {
    const text = withoutDiacritics(await readFile(join(ROOT, file), 'utf8'))
    for (const { term, pattern } of patterns) {
      const match = pattern.exec(text)
      if (match) leaks.push({ file, line: text.slice(0, match.index).split('\n').length, term })
    }
  }

  if (leaks.length > 0) {
    for (const leak of leaks) console.error(`${leak.file}:${leak.line}  contains "${leak.term}"`)
    throw new Error(`\nLeak check failed: ${leaks.length} private name(s) in public files.`)
  }
  console.log(`Leak check passed: no private names in ${files.length} files.`)
})

/** Every name and variant, plus the parts of combined names such as "A / B" and "site.tld". */
function searchTerms(names: Names): string[] {
  const terms = Object.values(names)
    .flatMap((entry) => Object.values(entry))
    .flatMap((value) => [value, ...value.split(/[/,()]/), value.replace(/\.[a-z]{2,}$/i, '')])
    .map((term) => withoutDiacritics(term.trim()))
    .filter((term) => term.length >= MIN_LENGTH)

  return [...new Set(terms)]
}

function wholeWord(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const flags = term.length >= IGNORE_CASE_FROM ? 'iu' : 'u'
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, flags)
}

/** A name written without its accents (ö as o, é as e) is still a leak. */
function withoutDiacritics(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '')
}

/** Tracked files plus untracked ones that are not ignored: everything `git add -A` would take. */
function publishableFiles(): string[] {
  const listing = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: ROOT, encoding: 'utf8' },
  )
  return listing
    .split('\0')
    .filter((file) => file.length > 0 && isText(file) && existsSync(join(ROOT, file)))
}

async function builtFiles(): Promise<string[]> {
  const dist = join(ROOT, 'dist')
  if (!existsSync(dist)) return []

  const entries = await readdir(dist, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && isText(entry.name))
    .map((entry) => relative(join(entry.parentPath, entry.name)))
}

function isText(file: string): boolean {
  return !BINARY_EXTENSIONS.has(extname(file).toLowerCase())
}
