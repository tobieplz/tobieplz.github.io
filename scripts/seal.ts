/**
 * Encrypts private/names.json into src/vault/sealed.json.
 *
 *   pnpm seal                 asks for the passphrase (or reads VAULT_PASSPHRASE)
 *   pnpm seal --allow-weak    skips the passphrase strength check
 */
import { readFile, writeFile } from 'node:fs/promises'

import { seal, unseal } from '../src/vault/crypto.ts'
import { parseNames, SLOTS } from '../src/vault/names.ts'
import { NAMES_PATH, VAULT_PATH, readPassphrase, relative, run, weakness } from './lib.ts'

await run(async () => {
  const names = parseNames(JSON.parse(await readNamesFile()))

  const passphrase = await readPassphrase({ confirm: true })
  const problem = weakness(passphrase)
  if (problem && !process.argv.includes('--allow-weak')) {
    throw new Error(`${problem}\nPass --allow-weak to seal anyway.`)
  }

  const vault = await seal(names, passphrase)

  // Open it again before writing, so a broken vault can never replace a working one.
  const reopened = await unseal(vault, passphrase)
  if (!reopened.ok || JSON.stringify(reopened.data) !== JSON.stringify(names)) {
    throw new Error('The sealed vault did not open again. Nothing was written.')
  }

  await writeFile(VAULT_PATH, `${JSON.stringify(vault, null, 2)}\n`)
  console.log(`Sealed ${SLOTS.length} names into ${relative(VAULT_PATH)}.`)
})

async function readNamesFile(): Promise<string> {
  try {
    return await readFile(NAMES_PATH, 'utf8')
  } catch {
    throw new Error(
      `${relative(NAMES_PATH)} is missing. Run "pnpm unseal" to recreate it from the vault.`,
    )
  }
}
