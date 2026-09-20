/**
 * GitHub Pages has no server-side rewrite, so a deep link such as
 * `/collusion/anthropic/claude-api` 404s on a cold load — there is no file at that
 * path. Pages does serve `404.html` for any unmatched path, and the built `index.html`
 * is a self-contained SPA shell whose asset URLs are absolute (they include the base
 * path), so copying it makes every route load correctly with the URL preserved.
 *
 * This is why the app can use `BrowserRouter` instead of falling back to hash routing.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const source = join(dist, 'index.html')

if (!existsSync(source)) {
  console.error('✗ dist/index.html not found — run the build first')
  process.exit(1)
}

copyFileSync(source, join(dist, '404.html'))
console.log('✓ wrote dist/404.html (SPA deep-link fallback for GitHub Pages)')
