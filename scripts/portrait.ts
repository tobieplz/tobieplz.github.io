/**
 * Prepares the portrait from a photo.
 *
 *   pnpm portrait                       reads assets-src/portrait.webp
 *   pnpm portrait path/to/photo.jpg     reads another photo instead
 *
 * The photo keeps its colours. It is written as WebP in two sizes, for the
 * page to choose between, and the sizes are noted beside them so that the page
 * can reserve the right space before the picture has loaded.
 *
 * A file beside the photo with the same name, ending in `.trim.json`, says how
 * much to cut from each edge, as a share of the photo's width or height:
 *
 *   { "left": 0.125, "top": 0.102, "right": 0.143, "bottom": 0 }
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { relative, run } from './lib.ts'

const DEFAULT_SOURCE = fileURLToPath(new URL('../assets-src/portrait.webp', import.meta.url))
const LARGE = fileURLToPath(new URL('../src/assets/portrait.webp', import.meta.url))
const SMALL = fileURLToPath(new URL('../src/assets/portrait-small.webp', import.meta.url))
const SIZES = fileURLToPath(new URL('../src/assets/portrait.json', import.meta.url))

/** Enough for the photo at its widest on a high-density screen. Never larger than the source. */
const LARGE_WIDTH = 1280
/** For screens of ordinary density: two thirds of the large one, and at most this wide. */
const SMALL_WIDTH = 720

const EDGES = ['left', 'top', 'right', 'bottom'] as const
type Trim = Record<(typeof EDGES)[number], number>

await run(async () => {
  const source = process.argv[2] ?? DEFAULT_SOURCE
  const trim = await readTrim(source.replace(/\.[^./\\]+$/, '.trim.json'))

  // Decode once, upright and on white, so that the trim is measured on the photo as it is seen.
  const { data, info } = await sharp(source)
    .rotate()
    .flatten({ background: '#fff' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixels = { raw: { width: info.width, height: info.height, channels: info.channels } }

  const left = Math.round(info.width * trim.left)
  const top = Math.round(info.height * trim.top)
  const kept = {
    left,
    top,
    width: info.width - left - Math.round(info.width * trim.right),
    height: info.height - top - Math.round(info.height * trim.bottom),
  }

  const write = (width: number, output: string) =>
    sharp(data, pixels)
      .extract(kept)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(output)

  const large = await write(LARGE_WIDTH, LARGE)
  const small = await write(Math.min(SMALL_WIDTH, Math.round((large.width * 2) / 3)), SMALL)
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
      `The photo is small, so it will look soft. ${SMALL_WIDTH} px wide or more is ideal.`,
    )
  }
})

/** Reads the trim file if there is one. Without it nothing is cut. */
async function readTrim(path: string): Promise<Trim> {
  let json: string
  try {
    json = await readFile(path, 'utf8')
  } catch {
    return { left: 0, top: 0, right: 0, bottom: 0 }
  }

  const trim = JSON.parse(json) as Partial<Trim>
  for (const edge of EDGES) {
    const share = trim[edge]
    if (typeof share !== 'number' || share < 0 || share >= 0.5) {
      throw new Error(`${relative(path)}: "${edge}" must be a number from 0 up to 0.5.`)
    }
  }
  return trim as Trim
}
