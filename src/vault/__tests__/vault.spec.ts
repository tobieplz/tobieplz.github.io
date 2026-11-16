// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { seal, type SealedVault } from '../crypto'
import { SLOTS, type Names } from '../names'
import { createVault } from '../vault'

const PASSPHRASE = 'four quiet words here'
const SESSION_KEY = 'vault.names'
const names = Object.fromEntries(SLOTS.map((slot) => [slot, { name: `Name ${slot}` }])) as Names

let sealed: SealedVault

beforeAll(async () => {
  sealed = await seal(names, PASSPHRASE, 1_000)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function newVault() {
  return createVault(() => Promise.resolve(sealed))
}

/** Just enough of a browser for resume(): an address, a history entry and session storage. */
function stubBrowser({ hash = '', stored }: { hash?: string; stored?: string } = {}) {
  const session = new Map<string, string>(stored === undefined ? [] : [[SESSION_KEY, stored]])
  const replaceState = vi.fn<(state: unknown, unused: string, url: string) => void>()

  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => session.get(key) ?? null,
    setItem: (key: string, value: string) => void session.set(key, value),
    removeItem: (key: string) => void session.delete(key),
  })
  vi.stubGlobal('window', {
    location: { hash, pathname: '/sv/', search: '' },
    history: { state: { position: 3 }, replaceState },
  })

  return { session, replaceState }
}

describe('attempt', () => {
  it('starts locked, with nothing revealed', () => {
    const vault = newVault()

    expect(vault.phase.value).toBe('locked')
    expect(vault.names.value).toBeNull()
  })

  it('opens for the right passphrase and asks for the wave', async () => {
    const vault = newVault()
    vault.begin('field-1')

    expect(await vault.attempt(PASSPHRASE)).toBe(true)

    expect(vault.phase.value).toBe('unlocked')
    expect(vault.names.value).toEqual(names)
    expect(vault.revealStyle.value).toBe('wave')
    expect(vault.activeField.value).toBeNull()
  })

  it('reports a wrong passphrase and locks again', async () => {
    const vault = newVault()

    const pending = vault.attempt('not the passphrase')
    expect(vault.phase.value).toBe('checking')

    expect(await pending).toBe(false)
    expect(vault.phase.value).toBe('locked')
    expect(vault.denials.value).toBe(1)
  })

  it('says nothing when a quiet attempt fails', async () => {
    const vault = newVault()

    const pending = vault.attempt('not the passphrase', { quiet: true })
    expect(vault.phase.value).toBe('locked')

    expect(await pending).toBe(false)
    expect(vault.denials.value).toBe(0)
  })

  it('does not bother deriving a key from nothing', async () => {
    const loadSealed = vi.fn<() => Promise<SealedVault>>(() => Promise.resolve(sealed))
    const vault = createVault(loadSealed)

    expect(await vault.attempt('   ')).toBe(false)
    expect(loadSealed).not.toHaveBeenCalled()
    expect(vault.denials.value).toBe(0)
  })

  it('discards a result that arrives after the field was cancelled', async () => {
    const vault = newVault()
    vault.begin('field-1')

    const pending = vault.attempt(PASSPHRASE)
    vault.cancel()

    expect(await pending).toBe(false)
    expect(vault.phase.value).toBe('locked')
    expect(vault.names.value).toBeNull()
  })

  it('lets only the latest of two overlapping attempts decide', async () => {
    const vault = newVault()

    const first = vault.attempt(PASSPHRASE, { quiet: true })
    const second = vault.attempt('typed one letter too many', { quiet: true })

    expect(await first).toBe(false)
    expect(await second).toBe(false)
    expect(vault.phase.value).toBe('locked')
  })

  it('treats a vault that cannot be loaded as a failed attempt, loudly', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
    const vault = createVault(() => Promise.reject(new Error('offline')))

    expect(await vault.attempt(PASSPHRASE)).toBe(false)
    expect(vault.phase.value).toBe('locked')
    expect(logged).toHaveBeenCalledOnce()
  })
})

describe('the passphrase field', () => {
  it('belongs to one cell at a time and counts keystrokes', () => {
    const vault = newVault()

    vault.begin('field-1')
    vault.keystroke()
    vault.keystroke()

    expect(vault.activeField.value).toBe('field-1')
    expect(vault.pulse.value).toBe(2)

    vault.cancel()
    expect(vault.activeField.value).toBeNull()
  })

  it('cannot be opened once the vault is unlocked', async () => {
    const vault = newVault()
    await vault.attempt(PASSPHRASE)

    vault.begin('field-1')

    expect(vault.activeField.value).toBeNull()
  })
})

describe('lock', () => {
  it('hides the names and forgets the session', async () => {
    const { session } = stubBrowser()
    const vault = newVault()
    await vault.attempt(PASSPHRASE)
    expect(session.has(SESSION_KEY)).toBe(true)

    vault.lock()

    expect(vault.phase.value).toBe('locked')
    expect(vault.names.value).toBeNull()
    expect(session.has(SESSION_KEY)).toBe(false)
  })
})

describe('resume', () => {
  it('does nothing on a plain visit', async () => {
    const { replaceState } = stubBrowser()
    const vault = newVault()

    await vault.resume()

    expect(vault.phase.value).toBe('locked')
    expect(replaceState).not.toHaveBeenCalled()
  })

  it('opens from a secret link and wipes the passphrase from the address', async () => {
    const { session, replaceState } = stubBrowser({ hash: `#k=${encodeURIComponent(PASSPHRASE)}` })
    const vault = newVault()

    await vault.resume()

    expect(vault.phase.value).toBe('unlocked')
    expect(vault.revealStyle.value).toBe('wave')
    expect(replaceState).toHaveBeenCalledExactlyOnceWith({ position: 3 }, '', '/sv/')
    expect(session.has(SESSION_KEY)).toBe(true)
  })

  it('refuses a secret link with the wrong passphrase, and still cleans the address', async () => {
    const { replaceState } = stubBrowser({ hash: '#k=nope' })
    const vault = newVault()

    await vault.resume()

    expect(vault.phase.value).toBe('locked')
    expect(vault.denials.value).toBe(1)
    expect(replaceState).toHaveBeenCalledOnce()
  })

  it('restores an unlocked session without replaying the animation', async () => {
    stubBrowser({ stored: JSON.stringify(names) })
    const vault = newVault()

    await vault.resume()

    expect(vault.phase.value).toBe('unlocked')
    expect(vault.names.value).toEqual(names)
    expect(vault.revealStyle.value).toBe('instant')
  })

  it('ignores a session it cannot make sense of', async () => {
    stubBrowser({ stored: '{"c01":' })
    const vault = newVault()

    await vault.resume()

    expect(vault.phase.value).toBe('locked')
  })

  it('reports that unlocking is unavailable without Web Crypto', async () => {
    stubBrowser()
    vi.stubGlobal('crypto', {})
    const vault = newVault()

    await vault.resume()
    vault.begin('field-1')

    expect(vault.supported.value).toBe(false)
    expect(vault.activeField.value).toBeNull()
    expect(await vault.attempt(PASSPHRASE)).toBe(false)
  })
})
