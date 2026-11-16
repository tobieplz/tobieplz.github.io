import {
  inject,
  ref,
  shallowRef,
  type App,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from 'vue'

import { normalizePassphrase, unseal, type SealedVault } from './crypto'
import { parseNames, type Names } from './names'

export type VaultPhase = 'locked' | 'checking' | 'unlocked'
/** How the names should appear: decoded in a wave, or simply there (restored from the session). */
export type RevealStyle = 'wave' | 'instant'

export interface Vault {
  readonly phase: Readonly<Ref<VaultPhase>>
  readonly names: Readonly<ShallowRef<Names | null>>
  /** Id of the redacted cell currently acting as the passphrase field, if any. */
  readonly activeField: Readonly<Ref<string | null>>
  /** Goes up on every keystroke in the field, so the other cells can flicker along. */
  readonly pulse: Readonly<Ref<number>>
  /** Goes up every time a submitted passphrase is refused. */
  readonly denials: Readonly<Ref<number>>
  readonly revealStyle: Readonly<Ref<RevealStyle>>
  /** False where Web Crypto is missing, which in practice means a page served over plain http. */
  readonly supported: Readonly<Ref<boolean>>

  begin(fieldId: string): void
  cancel(): void
  keystroke(): void
  /**
   * Tries a passphrase. A quiet attempt is the page guessing along while the
   * visitor types: it opens the vault if it can and says nothing if it cannot.
   */
  attempt(passphrase: string, options?: { quiet?: boolean }): Promise<boolean>
  lock(): void
  /** Picks up an unlocked session or a secret link. Browser only; call once the app is mounted. */
  resume(): Promise<void>
}

const SESSION_KEY = 'vault.names'
/** A link ending in `#k=<passphrase>` opens the page already unlocked. */
const LINK_PREFIX = '#k='

export function createVault(loadSealed: () => Promise<SealedVault>): Vault {
  const phase = ref<VaultPhase>('locked')
  const names = shallowRef<Names | null>(null)
  const activeField = ref<string | null>(null)
  const pulse = ref(0)
  const denials = ref(0)
  const revealStyle = ref<RevealStyle>('instant')
  const supported = ref(true)

  /** Every attempt gets a number; only the latest one may change anything. */
  let attempts = 0

  function open(revealed: Names, style: RevealStyle): void {
    names.value = revealed
    revealStyle.value = style
    activeField.value = null
    phase.value = 'unlocked'
    remember(revealed)
  }

  async function attempt(passphrase: string, { quiet = false } = {}): Promise<boolean> {
    if (phase.value === 'unlocked') return true
    if (!supported.value || normalizePassphrase(passphrase) === '') return false

    const id = ++attempts
    if (!quiet) phase.value = 'checking'

    let revealed: Names | null = null
    try {
      const result = await unseal(await loadSealed(), passphrase)
      if (result.ok) revealed = parseNames(result.data)
    } catch (error) {
      // A vault that will not load or parse is a build problem, not a wrong guess.
      console.error(error)
    }

    // Typing on, cancelling or locking while the key was being derived makes this result stale.
    if (id !== attempts) return false

    if (revealed) {
      open(revealed, 'wave')
      return true
    }
    if (phase.value === 'checking') phase.value = 'locked'
    if (!quiet) denials.value++
    return false
  }

  return {
    phase,
    names,
    activeField,
    pulse,
    denials,
    revealStyle,
    supported,

    begin(fieldId) {
      if (phase.value !== 'locked' || !supported.value) return
      activeField.value = fieldId
      // Fetch the ciphertext now, so it is there by the time the passphrase is typed.
      loadSealed().catch(() => {})
    },

    cancel() {
      attempts++
      activeField.value = null
      if (phase.value === 'checking') phase.value = 'locked'
    },

    keystroke() {
      pulse.value++
    },

    attempt,

    lock() {
      attempts++
      names.value = null
      activeField.value = null
      phase.value = 'locked'
      remember(null)
    },

    async resume() {
      supported.value = Boolean(globalThis.crypto?.subtle)

      const linked = takePassphraseFromAddress()
      const remembered = recall()
      if (remembered) {
        open(remembered, 'instant')
      } else if (linked) {
        await attempt(linked)
      }
    },
  }
}

const vaultKey: InjectionKey<Vault> = Symbol('vault')

/** One vault per app instance, so nothing is shared between prerender passes. */
export function installVault(app: App, vault: Vault = createVault(sealedFileLoader())): void {
  app.provide(vaultKey, vault)
}

/** The ciphertext is its own chunk, fetched once and only when someone starts typing. */
function sealedFileLoader(): () => Promise<SealedVault> {
  let sealed: Promise<SealedVault> | undefined

  return () =>
    (sealed ??= import('./sealed.json').then(
      (module) => module.default,
      (error: unknown) => {
        // Let the next attempt try the download again.
        sealed = undefined
        throw error
      },
    ))
}

export function useVault(): Vault {
  const vault = inject(vaultKey)
  if (!vault) throw new Error('useVault() needs installVault() to have run')
  return vault
}

/** Keeps the revealed names for this tab only, so a reload does not lock the page again. */
function remember(names: Names | null): void {
  try {
    if (names) sessionStorage.setItem(SESSION_KEY, JSON.stringify(names))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage can be blocked or full. The vault then simply locks again on reload.
  }
}

function recall(): Names | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    return stored ? parseNames(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

function takePassphraseFromAddress(): string | null {
  const { hash, pathname, search } = window.location
  if (!hash.startsWith(LINK_PREFIX)) return null

  // Remove the passphrase from the address bar and from this history entry straight away.
  window.history.replaceState(window.history.state, '', pathname + search)
  try {
    return decodeURIComponent(hash.slice(LINK_PREFIX.length))
  } catch {
    return null
  }
}
