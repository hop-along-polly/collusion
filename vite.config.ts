import { execFileSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * The site is served from the root of its own domain, `flashcards.codescribes.io`, so the
 * base path is `/`.
 *
 * `BASE_PATH` is kept as an override for a deployment that is not at a domain root: a
 * GitHub Pages project site lives at `https://<owner>.github.io/<repo>/` and needs
 * `/<repo>/` instead, which is what a fork without its own domain would want.
 */
const base = process.env.BASE_PATH ?? '/'

/**
 * The ref that citation and "view on GitHub" links point at, injected as `__REPO_REF__`
 * and read by `src/utils/github.ts`.
 *
 * This was hardcoded to `master`, which is right in production and wrong everywhere else:
 * a note added on a branch does not exist on master yet, so every link to it 404s, and a
 * dead citation looks the same as a wrong one. Resolving the ref at build time makes a
 * branch build link to its own branch.
 *
 * `REPO_REF` overrides everything, for a fork or a build from an exported tree.
 */
function resolveRepoRef(): string {
  if (process.env.REPO_REF) return process.env.REPO_REF

  const fromActions = process.env.GITHUB_REF_NAME
  if (fromActions) {
    // On a pull_request event this is `<number>/merge`, a ref nobody can browse to, so
    // use the commit instead. The deploy workflow only runs on master, but a future
    // workflow might not.
    if (fromActions.endsWith('/merge')) return process.env.GITHUB_SHA ?? 'master'
    return fromActions
  }

  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    // A detached HEAD reports the literal "HEAD", which is not a ref a URL can use. The
    // commit SHA is.
    if (branch && branch !== 'HEAD') return branch

    return (
      execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || 'master'
    )
  } catch {
    // No git, or not a repository: a source tarball, say. Production is master.
    return 'master'
  }
}

export default defineConfig({
  base,
  define: {
    __REPO_REF__: JSON.stringify(resolveRepoRef()),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // Card sets are code-split per set (see src/data/loader.ts), so keep chunk
    // warnings meaningful by lowering the noise floor.
    chunkSizeWarningLimit: 600,
  },
})
