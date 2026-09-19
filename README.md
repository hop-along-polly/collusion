# Collusion — study notes & Scribe Cards

Hand-written Markdown notes for technical certifications, plus **Scribe Cards**: a static
flashcard app generated from those notes.

The notes are the source of truth. Every flashcard question, explanation and distractor is
grounded in a committed `.md` file in this repository and cites the specific file and heading
it came from — a build-time gate fails the build if a citation stops resolving.

| | |
|---|---|
| **Notes** | [`Ansible.md`](Ansible.md), [`github_cd-cd.md`](github_cd-cd.md), [`Anthropic Academy/`](Anthropic%20Academy) |
| **App** | Vite + React + TypeScript + React Router, Tailwind CSS |
| **Cards** | 67 across 4 sets — see [Card sets](#card-sets) |
| **Hosting** | GitHub Pages, fully static — no backend, no database, no accounts |
| **Style** | [CodeScribes Brand Style Guide](https://github.com/hop-along-polly/codescribes-styleguide/blob/main/BRAND_STYLE_GUIDE.md) |

---

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Validate card data → typecheck → production build → write SPA fallback |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (engine, storage, validation) + DOM integration tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run typecheck` | TypeScript, no emit |
| `npm run validate:data` | Check every card and citation against the notes |
| `npm run deploy` | Build and push `dist/` to the `gh-pages` branch |

`npm run build` runs the data gate first, so a malformed card or a citation pointing at a
heading that no longer exists fails the build rather than shipping broken.

---

## Card sets

| Domain | Set | Cards | Derived from |
|---|---|---:|---|
| Anthropic | Building with the Claude API | 34 | `Anthropic Academy/building_with_claude_api.md` |
| Anthropic | Agent Skills | 9 | `Anthropic Academy/agent_skills.md` |
| DevOps | GitHub CI/CD | 12 | `github_cd-cd.md` |
| DevOps | Ansible Fundamentals | 12 | `Ansible.md` |

**AWS is present in the navigation but has no cards**, because this repository contains no AWS
notes yet. Rather than inventing questions, the AWS domain renders an honest empty state
explaining what is needed. Drop in a note file and a card set and it lights up with no code
change — see below.

Question types follow the source material: *select one* (exactly one correct answer of four),
*select all that apply* (one or more correct, at least four options), and *true / false*.
Grading is all-or-nothing on multi-answer cards, which is how the real exams score them.

---

## Adding new flashcards

Adding cards, a set, or a whole domain is a **data-only change**. No component, route or type
needs to be touched.

### Add cards to an existing set

1. Open the set's file, e.g. `data/anthropic/claude-api/cards.json`.
2. Append an object to `cards`:

```jsonc
{
  "id": "prompt-caching-rules",        // unique in the set; never renumber — progress is keyed on it
  "type": "multi",                     // "single" | "multi" | "boolean"
  "prompt": "Which statements about prompt caching are correct? (Select all that apply)",
  "tags": ["caching"],
  "options": [
    { "id": "a", "text": "…", "correct": true,  "rationale": "Why this one is right." },
    { "id": "b", "text": "…", "correct": false, "rationale": "Why this distractor is tempting but wrong." }
    // single → exactly 4 options, exactly 1 correct
    // multi  → 4+ options, 1+ correct, never all correct
    // boolean → exactly ["True", "False"], in that order
  ],
  "explanation": "Prose shown after Submit: why the key is the key.",
  "citations": [
    { "file": "Anthropic Academy/building_with_claude_api.md", "heading": "Prompt Caching" }
  ]
}
```

3. Bump `cardCount` for that set in `data/catalog.json`.
4. `npm run validate:data`.

**Citations:** use `heading` when the label is a real Markdown `#` heading — the citation then
deep-links to GitHub's anchor. Use `section` when it is a labelled region that is *not* a
heading (Ansible.md numbers its sections as list items; `github_cd-cd.md` marks some with bold
text) — the citation names the region and links to the file, never to an anchor that does not
exist. The validator enforces this both ways, so a dead anchor cannot ship.

### Add a new set

```bash
mkdir -p data/<domain>/<set>
$EDITOR data/<domain>/<set>/cards.json     # { "id": "<set>", "title": "…", "cards": [ … ] }
```

Then register it in `data/catalog.json` under `sets`. `path` must equal `<domain>/<set>` — it is
simultaneously the data directory, the route (`/<domain>/<set>`), and the progress storage key,
and the validator checks all three agree.

### Add a new domain

Add an entry to `domains` in `data/catalog.json` (`id`, `title`, `tagline`, `description`,
`status`, `icon`, `order`). Set `status: "planned"` to list it with an empty state before any
cards exist. Icons come from the small set in `src/components/ui/Icon.tsx`.

Full details, including the rationale behind each boundary, are in
[ARCHITECTURE.md](ARCHITECTURE.md).

---

## Deploying to GitHub Pages

### Automatic (recommended)

Push to `master`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) typechecks,
tests, builds and publishes. One-time setup: **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

The workflow passes `BASE_PATH=/${{ github.event.repository.name }}/`, so a fork or a repository
rename needs no code change.

### Manual, one command

```bash
npm run deploy
```

Builds and pushes `dist/` to the `gh-pages` branch via the `gh-pages` package. For this path,
set **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root**.

### Why deep links work

GitHub Pages has no rewrite rules, so `/collusion/anthropic/claude-api` would 404 on a cold
load. The build's `postbuild` step copies `index.html` to `404.html`; Pages serves that for any
unmatched path, and since the shell's asset URLs already include the base path, the app boots
and React Router resolves the URL. That is what lets the app use real paths instead of
`#/hash` URLs.

The base path defaults to `/collusion/` in production builds and `/` in development
(`vite.config.ts`); `BASE_PATH` overrides it.

---

## Progress and privacy

Progress — cards answered, per-card correct/incorrect counts, and anything marked for review —
lives in `localStorage` under `scribe-cards.progress.v1`. Nothing leaves the browser, there is
no analytics, and no account is required. Each set can be reset individually from its set page.

---

## Planned: the freemium path

v1 is deliberately backend-free, but the seams for it are already in place. Nothing below
requires a rewrite:

- **Progress is already a server-shaped document.** A `ProgressSnapshot`
  (`src/types/progress.ts`) is one JSON document per owner with `schemaVersion`, an `ownerId`
  (`"local"` until accounts exist), an `updatedAt` merge stamp, and monotonic per-card counters.
  It can be `PUT` to an API as-is, and two snapshots merge field-wise — counters add, `marked`
  ORs, `lastSeenAt` takes the max.
- **Storage is one swappable adapter.** Every mutation is a pure function over a snapshot; only
  `loadProgress` / `saveProgress` touch `localStorage`. Adding a server means implementing that
  pair against an API and keeping the local copy as an offline cache.
- **Gating is a catalog concern, not a code concern.** Card sets are already described by
  catalog metadata and loaded lazily per set. A `tier: "free" | "pro"` field on a set entry is
  enough to drive a paywall, and because each set is its own lazy chunk, paid content need not
  be in the free bundle at all.
- **Auth has a defined insertion point.** `ProgressProvider` is the single owner of the progress
  document; an auth provider wraps it and swaps `ownerId` from `"local"` to a real user id on
  sign-in, migrating the existing local document into the account.

What is explicitly *not* built: authentication, payments, leaderboards, or any server.

---

## Repository layout

```
Ansible.md, github_cd-cd.md, Anthropic Academy/   the study notes (source of truth)
data/
  catalog.json                                    domains + set registry
  <domain>/<set>/cards.json                       card content, one lazy chunk per set
src/
  data/        catalog, lazy loader, runtime validation
  engine/      pure quiz reducer + grading (no React)
  storage/     progress: pure updates + localStorage adapter
  hooks/       progress context, card loading, theme
  components/  ui/ primitives (style guide) + quiz/ feature components
  routes/      home, domain, set, quiz, 404
  types/       Card, Citation, QuizState, Progress, …
scripts/       data validation gate, SPA fallback writer
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the layers fit together and why.
