/**
 * Prepares the portrait from a photo.
 *
 *   pnpm portrait                       reads assets-src/portrait.png
 *   pnpm portrait path/to/photo.jpg     reads another photo instead
 *
 * The photo is cropped square around the face, converted to black and white
 * and written as a single WebP, never larger than the source.
 */
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { relative, run } from './lib.ts'

const DEFAULT_SOURCE = fileURLToPath(new URL('../assets-src/portrait.png', import.meta.url))
const OUTPUT = fileURLToPath(new URL('../src/assets/portrait.webp', import.meta.url))

/** Twice the largest size the page shows it at, for high-density screens. */
const MAX_SIZE = 960

await run(async () => {
  const source = process.argv[2] ?? DEFAULT_SOURCE

  const { width, height, size } = await sharp(source)
    .rotate() // Apply the camera's orientation before cropping.
    .flatten({ background: '#fff' })
    .resize(MAX_SIZE, MAX_SIZE, { fit: 'cover', position: 'attention', withoutEnlargement: true })
    .greyscale()
    .normalise()
    .webp({ quality: 82 })
    .toFile(OUTPUT)

  console.log(`Wrote ${relative(OUTPUT)}: ${width} x ${height}, ${(size / 1024).toFixed(1)} kB.`)
  if (width < MAX_SIZE / 2) {
    console.log(`The source is small, so it will look soft. ${MAX_SIZE / 2} px or more is ideal.`)
  }
})
