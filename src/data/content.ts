/**
 * Markdown content loading - the notes and the course study guides.
 *
 * Cards are data (`flashcards/`), but notes and study guides are prose, so they are
 * loaded as raw Markdown and rendered by `components/Markdown`.
 *
 * Everything here is lazy. The notes are the largest content in the repository, and
 * eagerly bundling them would put hundreds of kilobytes of Markdown into the initial
 * download for the sake of a list of titles. Instead the *index* is built from file
 * paths alone (synchronous, free) and bodies are fetched per page.
 */

import type { CourseMeta } from '../types/cards'

/** Keyed by absolute path, e.g. `/notes/aws/ai_practitioner.md`. */
const noteFiles = import.meta.glob<string>('/notes/*/*.md', {
  query: '?raw',
  import: 'default',
})

/** Keyed by absolute path, e.g. `/courses/aws/aif-c01.md`. */
const courseFiles = import.meta.glob<string>('/courses/*/*.md', {
  query: '?raw',
  import: 'default',
})

/** A note identified from its path alone - no file read required. */
export interface NoteRef {
  /** Basename without extension, e.g. `ai_practitioner`. Unique within a domain. */
  id: string
  /** The company/domain segment, e.g. `aws`. */
  domainId: string
  /** Repo-relative path, e.g. `notes/aws/ai_practitioner.md`. */
  file: string
}

export interface Note extends NoteRef {
  /** The first `# ` heading, falling back to a humanised filename. */
  title: string
  /** Raw Markdown, heading included. */
  body: string
}

function refFromPath(absolutePath: string): NoteRef {
  const file = absolutePath.replace(/^\//, '')
  const segments = file.split('/')
  const domainId = segments[1] ?? ''
  const filename = segments[2] ?? ''
  return { id: filename.replace(/\.md$/i, ''), domainId, file }
}

/** `ai_practitioner` → `Ai practitioner`. Only used when a note has no `# ` heading. */
function humanise(id: string): string {
  const words = id.replace(/[_-]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The first `# ` heading. Fenced code can legitimately contain `#` lines, so the scan
 * skips fences for the same reason the build gate's heading extractor does.
 */
function extractTitle(markdown: string, fallback: string): string {
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^#\s+(.*\S)\s*$/.exec(line)
    if (match?.[1]) return match[1]
  }
  return humanise(fallback)
}

/**
 * Built once at module load, which makes every `NoteRef` a stable object.
 *
 * That stability is load-bearing, not an optimisation: `useNote` keys its effect on the
 * ref it is given, so a lookup that minted a fresh object per render would re-fire the
 * effect on every render and spin forever.
 */
const allRefs: NoteRef[] = Object.keys(noteFiles)
  .map(refFromPath)
  .sort((a, b) => a.domainId.localeCompare(b.domainId) || a.id.localeCompare(b.id))

/** Every note on disk, sorted by domain then id. Cheap: paths only, no file reads. */
export function listNoteRefs(domainId?: string): NoteRef[] {
  return domainId ? allRefs.filter((ref) => ref.domainId === domainId) : allRefs
}

export function findNoteRef(domainId: string, noteId: string): NoteRef | undefined {
  return allRefs.find((ref) => ref.domainId === domainId && ref.id === noteId)
}

const noteCache = new Map<string, Note>()

export class ContentNotFoundError extends Error {
  constructor(path: string) {
    super(`No Markdown file found at /${path}`)
    this.name = 'ContentNotFoundError'
  }
}

export async function loadNote(ref: NoteRef): Promise<Note> {
  const cached = noteCache.get(ref.file)
  if (cached) return cached

  const importFile = noteFiles[`/${ref.file}`]
  if (!importFile) throw new ContentNotFoundError(ref.file)

  const body = await importFile()
  const note: Note = { ...ref, title: extractTitle(body, ref.id), body }
  noteCache.set(ref.file, note)
  return note
}

const guideCache = new Map<string, string>()

/** The study guide body for a course. `course.path` is `<domain>/<id>`, no extension. */
export async function loadCourseGuide(course: CourseMeta): Promise<string> {
  const file = `courses/${course.path}.md`
  const cached = guideCache.get(file)
  if (cached) return cached

  const importFile = courseFiles[`/${file}`]
  if (!importFile) throw new ContentNotFoundError(file)

  const body = await importFile()
  guideCache.set(file, body)
  return body
}

/**
 * GitHub's URL for a note, used by the "view on GitHub" affordances. Re-exported here
 * because this is where callers already look for it; the ref it is built from lives in
 * `@/utils/github`.
 */
export { githubUrl } from '@/utils/github'
