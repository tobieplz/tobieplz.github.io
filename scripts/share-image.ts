/**
 * Renders assets-src/share-image.html to public/og.png, the image shown when a
 * link to the site is shared.
 *
 *   pnpm share-image
 *
 * It photographs the page with headless Chrome, so the image uses the site's
 * real fonts. Set CHROME_PATH if Chrome is not in the usual place on macOS.
 */
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { relative, run } from './lib.ts'

const SOURCE = new URL('../assets-src/share-image.html', import.meta.url)
const OUTPUT = fileURLToPath(new URL('../public/og.png', import.meta.url))
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/** The size every large link preview is cropped from. */
const WIDTH = 1200
const HEIGHT = 630

await run(async () => {
  if (!existsSync(CHROME)) {
    throw new Error(`Chrome was not found at ${CHROME}. Set CHROME_PATH to its executable.`)
  }

  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      // The page loads its fonts from node_modules over file://.
      '--allow-file-access-from-files',
      // Give the fonts time to load before the picture is taken.
      '--virtual-time-budget=3000',
      `--window-size=${WIDTH},${HEIGHT}`,
      `--screenshot=${OUTPUT}`,
      SOURCE.href,
    ],
    { stdio: 'ignore' },
  )

  console.log(`Wrote ${relative(OUTPUT)} (${WIDTH} x ${HEIGHT}).`)
})
