/**
 * Links back into the repository the notes live in.
 *
 * The ref is resolved when the bundle is built rather than hardcoded. A hardcoded
 * `master` is wrong on every build that is not master: the file a citation points at may
 * not exist there yet, and the link then 404s with nothing in the UI to suggest the
 * answer was ever traceable. `vite.config.ts` resolves the ref and injects it as
 * `__REPO_REF__`.
 *
 * Under Vitest nothing defines that constant, so the `typeof` guard falls back to
 * `master`. That is why the check is `typeof` rather than a direct read: an undeclared
 * identifier would throw.
 */
declare const __REPO_REF__: string | undefined

export const REPO_URL = 'https://github.com/codescribes-llc/scribe-cards'

/** The branch, tag or commit this bundle was built from. */
export const repoRef: string =
  typeof __REPO_REF__ === 'string' && __REPO_REF__.length > 0 ? __REPO_REF__ : 'master'

/**
 * The GitHub URL for a repository-relative file, at the ref this bundle was built from.
 * Each segment is encoded separately so the slashes survive.
 */
export function githubUrl(file: string): string {
  const path = file.split('/').map(encodeURIComponent).join('/')
  return `${REPO_URL}/blob/${repoRef}/${path}`
}
