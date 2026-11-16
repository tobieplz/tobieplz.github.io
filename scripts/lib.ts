import { relative as relativePath } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { fileURLToPath } from 'node:url'

import { normalizePassphrase } from '../src/vault/crypto.ts'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Plaintext names. Gitignored; never leaves this machine. */
export const NAMES_PATH = fileURLToPath(new URL('../private/names.json', import.meta.url))
/** Ciphertext. Committed and shipped. */
export const VAULT_PATH = fileURLToPath(new URL('../src/vault/sealed.json', import.meta.url))

export function relative(path: string): string {
  return relativePath(ROOT, path)
}

/** Runs a script body and turns a thrown error into a one-line message and a failing exit code. */
export async function run(main: () => Promise<void>): Promise<void> {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}

/** Takes the passphrase from VAULT_PASSPHRASE, or asks for it without echoing it. */
export async function readPassphrase({ confirm }: { confirm: boolean }): Promise<string> {
  const fromEnvironment = process.env.VAULT_PASSPHRASE
  if (fromEnvironment) return fromEnvironment

  if (!process.stdin.isTTY) {
    throw new Error('Set VAULT_PASSPHRASE (for example in .env.local) or run this in a terminal.')
  }

  const passphrase = await askHidden('Passphrase: ')
  if (confirm && (await askHidden('Once more: ')) !== passphrase) {
    throw new Error('The two passphrases did not match.')
  }
  return passphrase
}

/**
 * The sealed file is public, so anyone can run guesses against it offline.
 * Returns what is wrong with a passphrase that would not survive that, or null.
 */
export function weakness(passphrase: string): string | null {
  const normalized = normalizePassphrase(passphrase)
  const words = normalized.split(/[\s\-_.]+/).filter(Boolean)
  const longEnough = normalized.length >= 20 || (words.length >= 4 && normalized.length >= 14)

  return longEnough
    ? null
    : 'That passphrase is too easy to guess. Use four or more words, or at least twenty characters.'
}

async function askHidden(prompt: string): Promise<string> {
  process.stdout.write(prompt)
  // readline echoes what is typed to its output stream, so give it one that discards everything.
  const silent = new Writable({ write: (_chunk, _encoding, done) => done() })
  const terminal = createInterface({ input: process.stdin, output: silent, terminal: true })
  try {
    return await terminal.question('')
  } finally {
    terminal.close()
    process.stdout.write('\n')
  }
}
