import { describe, expect, it } from 'vitest'

import { citationUrl } from '@/utils/format'
import { githubUrl, repoRef, REPO_URL } from '@/utils/github'

/**
 * These links are the product's only claim to being checkable, so a broken one costs more
 * than a missing feature. Two things are worth pinning: that the ref is a single resolved
 * value rather than three hardcoded copies, and that nothing builds a path by hand again.
 */
describe('github links', () => {
  it('falls back to master when no build-time ref was injected', () => {
    // Vitest does not apply Vite's `define`, so this is the fallback path. The real ref
    // comes from `resolveRepoRef` in vite.config.ts.
    expect(repoRef).toBe('master')
  })

  it('builds a blob URL at the resolved ref', () => {
    expect(githubUrl('notes/aws/all_aws_services.md')).toBe(
      `${REPO_URL}/blob/${repoRef}/notes/aws/all_aws_services.md`,
    )
  })

  it('encodes each path segment but keeps the separators', () => {
    expect(githubUrl('notes/aws/a note.md')).toBe(`${REPO_URL}/blob/${repoRef}/notes/aws/a%20note.md`)
  })

  it('points a citation at its heading anchor, through the same ref', () => {
    const url = citationUrl({
      file: 'notes/aws/all_aws_services.md',
      heading: 'Networking and Content Delivery',
    })
    expect(url).toBe(
      `${REPO_URL}/blob/${repoRef}/notes/aws/all_aws_services.md#networking-and-content-delivery`,
    )
  })

  it('stops at the file for a section, which has no anchor to point at', () => {
    const url = citationUrl({ file: 'notes/anthropic/ToolUseExample.py', section: 'The tool loop' })
    expect(url).toBe(`${REPO_URL}/blob/${repoRef}/notes/anthropic/ToolUseExample.py`)
  })
})
