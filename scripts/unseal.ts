/**
 * Decrypts src/vault/sealed.json back into private/names.json, for editing the
 * names on a machine that only has the repository.
 *
 *   pnpm unseal            asks for the passphrase (or reads VAULT_PASSPHRASE)
 *   pnpm unseal --force    overwrites an existing private/names.json
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { unseal, type SealedVault } from '../src/vault/crypto.ts'
import { parseNames, SLOTS } from '../src/vault/names.ts'
import { NAMES_PATH, VAULT_PATH, readPassphrase, relative, run } from './lib.ts'

await run(async () => {
  if (existsSync(NAMES_PATH) && !process.argv.includes('--force')) {
    throw new Error(`${relative(NAMES_PATH)} already exists. Pass --force to overwrite it.`)
  }

  const vault = JSON.parse(await readFile(VAULT_PATH, 'utf8')) as SealedVault
  const result = await unseal(vault, await readPassphrase({ confirm: false }))
  if (!result.ok) throw new Error('Wrong passphrase.')

  const names = parseNames(result.data)
  await mkdir(dirname(NAMES_PATH), { recursive: true })
  await writeFile(NAMES_PATH, `${JSON.stringify(names, null, 2)}\n`)
  console.log(`Wrote ${SLOTS.length} names to ${relative(NAMES_PATH)}.`)
})
