/**
 * Passphrase-based sealing of the private names.
 *
 * Everything here is plain Web Crypto, so the same module runs in the browser
 * and in the Node scripts that seal and unseal the vault. It deliberately has
 * no imports for that reason.
 *
 * AES-GCM authenticates the ciphertext, which means a wrong passphrase simply
 * fails to decrypt. No password or hash is stored anywhere.
 */

export interface SealedVault {
  readonly version: number
  /** PBKDF2-HMAC-SHA-256 rounds used to stretch the passphrase into a key. */
  readonly iterations: number
  readonly salt: string
  readonly iv: string
  readonly ciphertext: string
}

export type UnsealResult = { readonly ok: true; readonly data: unknown } | { readonly ok: false }

export const VAULT_VERSION = 1
export const DEFAULT_ITERATIONS = 600_000

const SALT_BYTES = 16
const IV_BYTES = 12
/** Plaintext is padded to a multiple of this, so the ciphertext length says nothing about the names. */
const PAD_BLOCK = 2048
const SPACE = 0x20

/**
 * Passphrases are compared after this normalisation, so a phone keyboard that
 * capitalises the first letter or adds a trailing space still unlocks.
 */
export function normalizePassphrase(input: string): string {
  return input.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
}

export async function seal(
  data: unknown,
  passphrase: string,
  iterations = DEFAULT_ITERATIONS,
): Promise<SealedVault> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt, iterations, 'encrypt')
  const plaintext = pad(new TextEncoder().encode(JSON.stringify(data)))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return {
    version: VAULT_VERSION,
    iterations,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  }
}

export async function unseal(vault: SealedVault, passphrase: string): Promise<UnsealResult> {
  if (vault.version !== VAULT_VERSION) {
    throw new Error(`Unsupported vault version ${vault.version}`)
  }

  const key = await deriveKey(passphrase, fromBase64(vault.salt), vault.iterations, 'decrypt')

  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(vault.iv) },
      key,
      fromBase64(vault.ciphertext),
    )
  } catch {
    // AES-GCM rejects a wrong key and tampered data alike. Either way the vault stays shut.
    return { ok: false }
  }

  // The padding is trailing spaces, which JSON.parse ignores.
  return { ok: true, data: JSON.parse(new TextDecoder().decode(plaintext)) }
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
  usage: 'encrypt' | 'decrypt',
) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalizePassphrase(passphrase)),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

function pad(bytes: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const padded = new Uint8Array(Math.ceil(bytes.length / PAD_BLOCK) * PAD_BLOCK).fill(SPACE)
  padded.set(bytes)
  return padded
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}
