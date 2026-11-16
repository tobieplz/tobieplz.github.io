/**
 * Prepares the portrait from a photo.
 *
 *   pnpm portrait                       reads assets-src/portrait.webp
 *   pnpm portrait path/to/photo.jpg     reads another photo instead
 *
 * The photo keeps its colours and its shape. It is written as WebP in two
 * sizes, for the page to choose between, and the sizes are noted beside them
 * so that the page can reserve the right space before the picture has loaded.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { relative, run } from './lib.ts'

const DEFAULT_SOURCE = fileURLToPath(new URL('../assets-src/portrait.webp', import.meta.url))
const LARGE = fileURLToPath(new URL('../src/assets/portrait.webp', import.meta.url))
const SMALL = fileURLToPath(new URL('../src/assets/portrait-small.webp', import.meta.url))
const SIZES = fileURLToPath(new URL('../src/assets/portrait.json', import.meta.url))

/** Enough for the photo at its widest on a high-density screen. Never larger than the source. */
const LARGE_WIDTH = 1280
/** Enough for a phone, and for a desktop screen of ordinary density. */
const SMALL_WIDTH = 720

await run(async () => {
  const source = process.argv[2] ?? DEFAULT_SOURCE

  const write = (width: number, output: string) =>
    sharp(source)
      .rotate() // Apply the camera's orientation first.
      .flatten({ background: '#fff' })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(output)

  const large = await write(LARGE_WIDTH, LARGE)
  const small = await write(SMALL_WIDTH, SMALL)
  const sizes = { width: large.width, height: large.height, smallWidth: small.width }
  await writeFile(SIZES, `${JSON.stringify(sizes, null, 2)}\n`)

  for (const [output, { width, height, size }] of [
    [LARGE, large],
    [SMALL, small],
  ] as const) {
    console.log(`Wrote ${relative(output)}: ${width} x ${height}, ${(size / 1024).toFixed(1)} kB.`)
  }
  if (large.width < SMALL_WIDTH) {
    console.log(
      `The source is small, so it will look soft. ${SMALL_WIDTH} px wide or more is ideal.`,
    )
  }
})
