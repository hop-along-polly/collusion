# Collusion - course material & Scribe Cards

Hand-written Markdown course material for technical certifications, written by practitioners
who have sat these exams and passed them, plus **Scribe Cards**: a static flashcard app built
from that material.

**The material is deliberately evergreen.** What k-means clustering is and the kind of problem it
belongs to reads the same today as it will in ten years, and that is the level these notes are
pitched at. The bet is that fundamentals are also the better exam strategy: a memorised answer only
helps with a question you have already seen, whereas understanding why a technique exists and when
it applies means an unfamiliar question is still answerable - reason from the fundamentals and they
lead to exactly one correct answer.

This is why cards are never written from a question bank or an exam recollection. They come from the
notes, which cover the subject rather than the test.

The Markdown is the source of truth. Every question, explanation and distractor comes from a
committed `.md` file and cites the specific file and heading behind it, and a build-time gate
fails the build if a citation stops resolving. That is the invariant the whole project is
organised around - and the reason a card can always be checked against its source rather than
taken on trust.

| | |
|---|---|
| **Notes** | [`notes/`](notes) - one Markdown file per topic, as `notes/<company>/<topic>.md` |
| **Courses** | [`courses/`](courses) - one study guide per certification, as `courses/<company>/<course-id>.md` |
| **Cards** | [`flashcards/`](flashcards) - 520 across 15 sets in 3 domains, see [Card sets](#card-sets) |
| **App** | Vite + React + TypeScript + React Router, Tailwind CSS |
| **Hosting** | GitHub Pages, fully static - no backend, no database, no accounts |
| **Style** | [CodeScribes Brand Style Guide](https://github.com/hop-along-polly/codescribes-styleguide/blob/main/BRAND_STYLE_GUIDE.md) |

---

## Three entities

The repository separates three things that used to be conflated, and the distinction runs
through the data model, the routes and the progress store:

| Entity | Lives in | Is |
|---|---|---|
| **Note** | `notes/<company>/<topic>.md` | One topic, written once. Read by any number of courses. |
| **Course** | `courses/<company>/<course-id>.md` | A study guide for one certification or track: the topics to read, in order, and the card sets that test them. |
| **Card set** | `flashcards/<domain>/<set-id>.json` | An authoring unit of 30-60 cards. Has no page of its own. |

Neither relationship is one-to-one: a note can be read by several courses, and a course draws
on several sets. That mapping lives in [`catalog.json`](catalog.json) and is never inferred
from paths.

**Flashcards are only ever launched from a course**, because results are recorded against the
certification being prepared for - see [Progress and privacy](#progress-and-privacy).

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
| `npm run validate:data` | Check every card, citation and course against the Markdown |
| `npm run deploy` | Build and push `dist/` to the `gh-pages` branch |

`npm run build` runs the data gate first, so a malformed card, a citation pointing at a heading
that no longer exists, or a course linking a note that was moved fails the build rather than
shipping broken.

---

## Card sets

Each set targets **30-60 cards** - enough to study a topic properly in one place, small enough
to finish. A set is split when one note turns out to be two study units, which is why the AI
Practitioner material is two sets rather than one oversized one.

| Domain | Set | Cards | Built from |
|---|---|---:|---|
| Anthropic | Building with the Claude API | 55 | `building_with_claude_api.md`, `ToolUseExample.py`, `claude_on_google_cloud.md` |
| Anthropic | Code Review & CI/CD | 37 | `code_review_cicd.md` |
| Anthropic | Agents SDK | 31 | `agents_sdk.md` |
| Anthropic | Multi-Agent Pipelines | 31 | `multi_agent_pipelines.md` |
| Anthropic | AI Fluency | 31 | `ai_fluency.md` |
| Anthropic | Claude 101 | 31 | `claude_101.md` |
| Anthropic | Agent Skills | 27 † | `agent_skills.md` |
| Anthropic | Model Context Protocol | 22 † | `intro_to_mcp.md` |
| AWS | AI Practitioner - AWS Services | 42 | `ai_practitioner.md` |
| AWS | AWS Marketplace - Listing Types | 40 | `saas.md`, `agents_and_tools.md`, `server_ami.md`, `server_container.md`, `machine_learning.md`, `data_product.md`, `marketplace_apis.md` |
| AWS | AWS Services | 38 | `all_aws_services.md`, `notes.md` |
| AWS | AI Practitioner - Concepts & Metrics | 34 | `ai_practitioner.md` |
| AWS | AWS Marketplace - Commercials | 32 | `overview.md`, `private_offers.md`, `renewals.md`, `professional_services.md`, `saas.md` |
| DevOps | Ansible Fundamentals | 37 | `Ansible.md` |
| DevOps | GitHub CI/CD | 32 | `github_cd-cd.md` |

**520 cards, 592 citations** - 291 select-one, 176 select-all-that-apply, 53 true/false.

Those 15 sets are grouped into **5 courses**: two certifications (CCAR-F, AIF-C01) and three
study tracks with no exam behind them (AWS Marketplace, Ansible, GitHub Actions).

† **Below the 30-card target because the source note is thin, not because the set is
unfinished.** `agent_skills.md` and `intro_to_mcp.md` are both short and already covered
point-for-point. Reaching 30 would mean inventing questions the material does not support,
which is the one thing this project will not do. Grow those two notes and the cards follow.

Question types follow the source material: *select one* (exactly one correct answer of four),
*select all that apply* (one or more correct, at least four options), and *true / false*.
Grading is all-or-nothing on multi-answer cards, which is how the real exams score them.

Every citation is checked against the Markdown at build time, so a card can never drift from
the section it claims to cite. When the Claude API notes were rewritten, the gate caught 18
citations pointing at headings that no longer existed - and three cards whose *content* the
rewrite had invalidated.

---

## Adding new flashcards

Adding cards, a set, a course or a whole domain is a **data-only change**. No component, route
or type needs to be touched.

Two skills automate the whole procedure and are the recommended path:

| Skill | Use it to |
|---|---|
| [`generate-flashcards`](.claude/skills/generate-flashcards/SKILL.md) | Rebuild one note's set from scratch. Destructive - regenerates ids, which resets progress for that set. |
| [`add-flashcards`](.claude/skills/add-flashcards/SKILL.md) | Cover newly added material without touching existing cards. Doing nothing is a valid outcome, so it is safe to run in CI. |

### Add cards to an existing set

1. Open the set's file, e.g. `flashcards/anthropic/claude-api.json`.
2. Append an object to `cards`:

```jsonc
{
  "id": "prompt-caching-rules",        // unique across the DOMAIN, not just the set - see below
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
    { "file": "notes/anthropic/building_with_claude_api.md", "heading": "Prompt Caching" }
  ]
}
```

3. Bump `cardCount` for that set in [`catalog.json`](catalog.json).
4. `npm run validate:data`.

**Card ids must be unique within the domain**, across every file under `flashcards/<domain>/`,
and the gate fails the build on a duplicate. Progress is stored per course under the bare card
id, and a course draws only on sets from its own domain, so two sets naming a card identically
would make one card's history indistinguishable from the other's. Ids deliberately carry **no
set prefix** - a prefix would orphan a card's history the moment its set were renamed or split.
Check before writing one:

```bash
grep -ho '"id": "[^"]*"' flashcards/<domain>/*.json | sort
```

A name already taken usually means the same fact is carded elsewhere in the domain, which is
worth looking at before renaming around it.

**Citations:** use `heading` when the label is a real Markdown `#` heading - the citation then
deep-links to GitHub's anchor. Use `section` when it is a labelled region that is *not* a
heading (`Ansible.md` numbers its sections as list items; `github_cd-cd.md` marks some with bold
text) - the citation names the region and links to the file, never to an anchor that does not
exist. The validator enforces this both ways, so a dead anchor cannot ship.

### Add a new set

```bash
$EDITOR flashcards/<domain>/<set-id>.json     # { "id": "<set-id>", "title": "…", "cards": [ … ] }
```

Then register it in [`catalog.json`](catalog.json) under `sets`, where `path` must equal
`<domain>/<set-id>`, and **add its id to the `setIds` of every course that should quiz it**.
A set no course lists is invisible in the app, so the last step is not optional. Add it to the
**Flashcards** column of that course's topic table too, so the study guide and the catalog agree.

### Add a new course

Write the study guide at `courses/<company>/<course-id>.md` - the topics in reading order, each
linking the notes to read and the sets that test them - then add an entry to `courses` in
`catalog.json`:

```jsonc
{
  "id": "aif-c01",
  "domainId": "aws",
  "path": "aws/aif-c01",                  // also the route and the progress storage key
  "title": "AWS Certified AI Practitioner",
  "subtitle": "AIF-C01",
  "description": "…",
  "kind": "certification",                // "certification" | "track"
  "setIds": ["ai-practitioner-foundations", "ai-practitioner-aws", "services"]
}
```

Use `kind: "track"` when there is no exam behind it, so the UI stops implying a certification.

### Add a new domain

Add an entry to `domains` in `catalog.json` (`id`, `title`, `tagline`, `description`, `status`,
`icon`, `order`). Set `status: "planned"` to list it with an empty state before any cards exist.
Icons come from the small set in `src/components/ui/Icon.tsx`.

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

GitHub Pages has no rewrite rules, so `/collusion/courses/aws/aif-c01` would 404 on a cold load.
The build's `postbuild` step copies `index.html` to `404.html`; Pages serves that for any
unmatched path, and since the shell's asset URLs already include the base path, the app boots
and React Router resolves the URL. That is what lets the app use real paths instead of `#/hash`
URLs.

The base path defaults to `/collusion/` in production builds and `/` in development
(`vite.config.ts`); `BASE_PATH` overrides it.

---

## Progress and privacy

Progress - cards answered, per-card correct/incorrect counts, and anything marked for review -
lives in `localStorage` under `scribe-cards.progress.v2`. Nothing leaves the browser, there is
no analytics, and no account is required.

**Progress is keyed by course, not by card set.** A card set can be listed by more than one course
in the same domain, so the same card can be tested by two certifications - and how ready you are
for one exam says nothing about the other. Keying by course keeps those as independent records:

```jsonc
{
  "schemaVersion": 2,
  "courses": {
    "aws/aif-c01": {
      "cards": { "embedding-vs-generation": { "attempts": 3, "correct": 2, … } },
      "sessionsCompleted": 1
    }
  }
}
```

The course path is the outer key and the card id sits inside it, bare - no set id appears in
storage at all, so renaming or splitting a set, or moving a card between sets, does not orphan
its history. Each course can be reset individually from its course page.

---

## Planned: the freemium path

v1 is deliberately backend-free, but the seams for it are already in place. Nothing below
requires a rewrite:

- **Progress is already a server-shaped document.** A `ProgressSnapshot`
  (`src/types/progress.ts`) is one JSON document per owner with `schemaVersion`, an `ownerId`
  (`"local"` until accounts exist), an `updatedAt` merge stamp, and monotonic per-card counters.
  It can be `PUT` to an API as-is, and two snapshots merge field-wise - counters add, `marked`
  ORs, `lastSeenAt` takes the max.
- **Storage is one swappable adapter.** Every mutation is a pure function over a snapshot; only
  `loadProgress` / `saveProgress` touch `localStorage`. Adding a server means implementing that
  pair against an API and keeping the local copy as an offline cache.
- **Gating is a catalog concern, not a code concern.** Courses and card sets are already
  described by catalog metadata and loaded lazily per file. A `tier: "free" | "pro"` field on a
  course entry is enough to drive a paywall, and because each set is its own lazy chunk, paid
  content need not be in the free bundle at all.
- **Auth has a defined insertion point.** `ProgressProvider` is the single owner of the progress
  document; an auth provider wraps it and swaps `ownerId` from `"local"` to a real user id on
  sign-in, migrating the existing local document into the account.

What is explicitly *not* built: authentication, payments, leaderboards, or any server.

---

## Repository layout

```
notes/<company>/<topic>.md                        the course material (source of truth)
courses/<company>/<course-id>.md                  study guides: topics to read + sets that test them
flashcards/<domain>/<set-id>.json                 card content, one lazy chunk per set
catalog.json                                      registry: domains, sets, courses
src/
  data/        catalog, lazy content + card loaders, runtime validation
  engine/      pure quiz reducer + grading (no React)
  quiz/        deck assembly - a course's sets become one session
  storage/     progress: pure updates + localStorage adapter
  hooks/       progress context, note loading, theme
  components/  ui/ primitives (style guide) + quiz/ feature components + Markdown rendering
  routes/      home, courses, course, course quiz, notes, note, domain, 404
  types/       Card, Citation, CourseMeta, QuizState, Progress, …
scripts/       data validation gate, SPA fallback writer
.claude/skills/  generate-flashcards, add-flashcards
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the layers fit together and why.
