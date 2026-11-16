// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { normalizePassphrase, seal, unseal, type SealedVault } from '../crypto'

// The real vault uses 600,000 rounds; that would only make these tests slow.
const ROUNDS = 1_000
const PASSPHRASE = 'four quiet words here'

describe('seal and unseal', () => {
  it('opens with the passphrase it was sealed with', async () => {
    const data = { c01: { name: 'Åre Öl & Bröd' } }

    const vault = await seal(data, PASSPHRASE, ROUNDS)

    expect(await unseal(vault, PASSPHRASE)).toEqual({ ok: true, data })
  })

  it('stays shut for a wrong passphrase', async () => {
    const vault = await seal({ secret: true }, PASSPHRASE, ROUNDS)

    expect(await unseal(vault, 'four quiet words there')).toEqual({ ok: false })
  })

  it('stays shut when the ciphertext has been tampered with', async () => {
    const vault = await seal({ secret: true }, PASSPHRASE, ROUNDS)
    const flipped = vault.ciphertext.startsWith('A') ? 'B' : 'A'
    const tampered: SealedVault = { ...vault, ciphertext: flipped + vault.ciphertext.slice(1) }

    expect(await unseal(tampered, PASSPHRASE)).toEqual({ ok: false })
  })

  it('ignores case, surrounding space and Unicode form in the passphrase', async () => {
    const vault = await seal({ secret: true }, 'smörgås på bordet nu', ROUNDS)
    const decomposed = '  SMÖRGÅS  på Bordet nu '.normalize('NFD')

    expect(await unseal(vault, decomposed)).toMatchObject({ ok: true })
  })

  it('never contains the plaintext', async () => {
    const vault = await seal({ name: 'Recognisable Name' }, PASSPHRASE, ROUNDS)

    expect(JSON.stringify(vault)).not.toContain('Recognisable')
  })

  it('uses a fresh salt and IV every time', async () => {
    const first = await seal({ secret: true }, PASSPHRASE, ROUNDS)
    const second = await seal({ secret: true }, PASSPHRASE, ROUNDS)

    expect(second.salt).not.toBe(first.salt)
    expect(second.iv).not.toBe(first.iv)
    expect(second.ciphertext).not.toBe(first.ciphertext)
  })

  it('pads the payload so its size does not track the names', async () => {
    const short = await seal({ name: 'A' }, PASSPHRASE, ROUNDS)
    const long = await seal({ name: 'A much longer client name than that' }, PASSPHRASE, ROUNDS)

    expect(long.ciphertext).toHaveLength(short.ciphertext.length)
  })

  it('refuses a vault from a different format version', async () => {
    const vault = await seal({ secret: true }, PASSPHRASE, ROUNDS)

    await expect(unseal({ ...vault, version: 2 }, PASSPHRASE)).rejects.toThrow('version')
  })
})

describe('normalizePassphrase', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalizePassphrase('  Open   The\tVault ')).toBe('open the vault')
  })
})
