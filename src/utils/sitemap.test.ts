import { describe, expect, it } from 'vitest'

import { catalog } from '@/data/catalog'
import { renderSitemap, sitemapPaths, type SitemapNote } from '@/utils/sitemap'

/**
 * Run against the real catalog, because the point of generating the sitemap is that it
 * matches the content. A test with a fixture catalog would pass while the real file listed
 * a course that no longer exists.
 */

const notes: SitemapNote[] = [
  { domainId: 'aws', id: 'ai_practitioner' },
  { domainId: 'devops', id: 'Ansible' },
]

describe('sitemapPaths', () => {
  const paths = sitemapPaths(catalog, notes)

  it('lists the index pages', () => {
    expect(paths).toContain('/')
    expect(paths).toContain('/courses')
    expect(paths).toContain('/notes')
  })

  it('lists every course in the catalog', () => {
    for (const course of catalog.courses) {
      expect(paths).toContain(`/courses/${course.path}`)
    }
    expect(catalog.courses.length).toBeGreaterThan(0)
  })

  it('lists every note it is given, at its route', () => {
    expect(paths).toContain('/notes/aws/ai_practitioner')
    expect(paths).toContain('/notes/devops/Ansible')
  })

  it('lists available domains and skips planned ones', () => {
    for (const domain of catalog.domains) {
      if (domain.status === 'available') expect(paths).toContain(`/${domain.id}`)
      else expect(paths).not.toContain(`/${domain.id}`)
    }
  })

  it('never lists a quiz route', () => {
    // A session is interactive state, not a document. Landing a searcher mid-question
    // would be a bad result for them and a thin page for the crawler.
    expect(paths.filter((path) => path.includes('/quiz'))).toEqual([])
  })

  it('has no duplicates', () => {
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('renderSitemap', () => {
  it('builds absolute URLs at the origin', () => {
    const xml = renderSitemap('https://flashcards.codescribes.io', '/', ['/', '/courses'])
    expect(xml).toContain('<loc>https://flashcards.codescribes.io/</loc>')
    expect(xml).toContain('<loc>https://flashcards.codescribes.io/courses</loc>')
  })

  it('honours a base path, so a project-path deployment still resolves', () => {
    const xml = renderSitemap('https://example.github.io', '/scribe-cards/', ['/courses'])
    expect(xml).toContain('<loc>https://example.github.io/scribe-cards/courses</loc>')
  })

  it('escapes XML, so an ampersand in a path cannot break the document', () => {
    const xml = renderSitemap('https://example.com', '/', ['/a&b'])
    expect(xml).toContain('<loc>https://example.com/a&amp;b</loc>')
    expect(xml).not.toContain('/a&b<')
  })

  it('emits one url element per path and nothing else', () => {
    const paths = sitemapPaths(catalog, notes)
    const xml = renderSitemap('https://flashcards.codescribes.io', '/', paths)
    expect((xml.match(/<url>/g) ?? []).length).toBe(paths.length)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })
})
