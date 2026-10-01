# Architecture

How Scribe Cards is put together, and why. For day-to-day tasks — running it, adding cards,
deploying — see [README.md](README.md).

## Three entities

The repository separates three things, and the split runs through the data model, the routes and
the progress store:

| Entity | Lives in | Is |
|---|---|---|
| **Note** | `notes/<company>/<topic>.md` | One topic, written once. Read by any number of courses. |
| **Course** | `courses/<company>/<course-id>.md` | A study guide for one certification or track: the topics to read and the sets that test them. |
| **Card set** | `flashcards/<domain>/<set-id>.json` | An authoring unit of 30-60 cards. Has no page of its own. |

Neither relationship is one-to-one — a note can be read by several courses, a course draws on
several sets — so the mapping lives in `catalog.json` and is never inferred from paths.

The consequence that shapes most of the design: **a card set is an authoring unit, not a place to
study.** Sessions are launched from a course, because that is the thing a learner is preparing
for and therefore the thing progress should be measured against.

## Set sizing

A card set targets **30-60 cards**. Below that a topic is not covered; above it, the set is
usually two study units wearing one name — which is why `AWS Marketplace` was split into
*Commercials* (the model shared by every listing) and *Listing Types* (per-listing mechanics
and the API surface), and why `ai_practitioner.md` produced *Concepts & Metrics* and
*AWS Services* rather than one 76-card set.

The target is a target, not a floor to pad toward. Two sets sit below it because their source
notes are short and are already covered exhaustively; the README marks them explicitly rather
than quietly filling the gap with weaker questions.

## The one rule

**Content is pure data.** The UI never hard-codes a question, an answer, an explanation, a
citation or a study guide. Everything a learner reads comes from JSON under `flashcards/` or
Markdown under `notes/` and `courses/`, which means adding a certification is a data-only change
and the quiz UI can be replaced without touching content.

Everything below follows from keeping that rule honest.

---

## Layers

```
        catalog.json      flashcards/<domain>/<set-id>.json   notes/**.md, courses/**.md
             │                        │                                │
             ▼                        ▼                                ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │ src/data/   catalog.ts (eager, tiny)   loader.ts (lazy, per set)             │
  │             content.ts (lazy, per Markdown file, `?raw`)                     │
  │             validate.ts — shape rules, shared with the build gate            │
  └──────────────────────────────────────────────────────────────────────────────┘
             │ Card, CardSetMeta, CourseMeta, DomainMeta, NoteRef
             ▼
  ┌────────────────────────────────┐   ┌────────────────────────────────┐
  │ src/engine/                    │   │ src/storage/                   │
  │ grade.ts  — grading a card     │   │ progress.ts — pure updates     │
  │ quiz.ts   — the session reducer│   │   + a localStorage adapter     │
  │ shuffle.ts— seeded ordering    │   │                                │
  │ (no React, no DOM, no storage) │   │ (React-free except the adapter)│
  └────────────────────────────────┘   └────────────────────────────────┘
             │                                        │
             ▼                                        │
  ┌────────────────────────────────┐                  │
  │ src/quiz/deck.ts               │                  │
  │ a course's sets → one Deck,    │                  │
  │ carrying its own progress key  │                  │
  └────────────────────────────────┘                  │
             │                                        │
             ▼                                        ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │ src/hooks/  useCardSet · useCourseSets · useContent · useProgress · useTheme │
  └──────────────────────────────────────────────────────────────────────────────┘
             │
             ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │ src/components/ui/     style-guide primitives (Button, Card, Alert…)         │
  │ src/components/quiz/   QuestionCard, OptionList, FeedbackPanel, QuizRunner   │
  │ src/components/        Markdown (lazy wrapper) → MarkdownRenderer            │
  │ src/routes/            Home, Courses, Course, CourseQuiz, Notes, Note,       │
  │                        Domain, NotFound                                      │
  └──────────────────────────────────────────────────────────────────────────────┘
```

Dependencies point strictly downward. The engine does not import a component; a component does
not compute a grade.

---

## Data layer

### Two tiers, on purpose

`catalog.json` is imported **eagerly**. It is a few hundred bytes per entry and carries
everything the index screens need — titles, descriptions, card counts, source files, which sets
each course draws on. So the landing page, course list and domain pages render without fetching a
single card.

`flashcards/<domain>/<set-id>.json` files are discovered by `import.meta.glob` and loaded
**lazily**, which makes Vite emit one chunk per set. The Markdown under `notes/` and `courses/`
is loaded the same way, with `?raw`, so a note is fetched only when someone opens it. The build
emits ~48 asset chunks for 15 card sets plus the Markdown files, and a learner studying Ansible
never downloads the Claude API cards.

The one dependency large enough to matter is the Markdown renderer. `react-markdown` plus
`remark-gfm` and `rehype-raw` is 333 kB — larger than the entire rest of the app at 241 kB — so
it sits behind `React.lazy` in `src/components/Markdown.tsx` and only note and course pages pay
for it. Quizzing never loads it:

```
dist/assets/index-*.js              240.76 kB   the app
dist/assets/MarkdownRenderer-*.js   333.44 kB   loaded only on a note or course page
```

The trade-off of the catalog is that a new set must be registered *and* exist on disk. That
duplication is deliberate — it buys real loading states and code splitting — and
`npm run validate:data` makes it impossible to get wrong, failing if either side is missing.

### Which identifier does what

Two different `path` fields exist, and they carry different weight. This was collapsed into one
identifier before card sets lost their pages, and separating them is what made per-certification
progress possible.

A **course** `path` (e.g. `aws/aif-c01`) is simultaneously:

- the study guide on disk — `courses/aws/aif-c01.md`
- the route — `/courses/aws/aif-c01`, and its quiz at `/courses/aws/aif-c01/quiz`
- the progress storage key — `snapshot.courses["aws/aif-c01"]`

A **set** `path` (e.g. `anthropic/claude-api`) is only:

- the card file on disk — `flashcards/anthropic/claude-api.json`
- its identity in the catalog, and in a course's `setIds`

A set is deliberately **not** a route and **not** a progress key. The validator asserts
`path === "<domainId>/<id>"` for both kinds, that every `setIds` entry is a real set in the same
domain, and that every course's study guide exists, so none of this can drift.

### Card ids are unique per domain

A card id must be unique across every file under `flashcards/<domain>/`, not merely within its own
set, and the build gate fails on a duplicate.

This follows from the storage model. Progress is recorded per course, a course draws only on sets
from its own domain, and a card is stored under its own id with **no set prefix**. Two sets in one
domain naming a card identically would make one card's history indistinguishable from the other's.

The absence of a prefix is the deliberate part. A `<setId>::<cardId>` key would be trivially
unique, but it would orphan a card's history the moment its set were renamed or split — and
splitting a long note into two sets is a routine operation the authoring skills perform
themselves. Bare ids mean a card's history survives being moved between sets.

### Validation runs in two places from one source

`src/data/validate.ts` is dependency-free TypeScript, so the same rules run in:

- **`scripts/validate-data.ts`** (the build gate) — plus the filesystem checks it alone can do:
  catalog ↔ disk agreement, `cardCount` accuracy, every cited note file exists, every cited
  `heading` is a real Markdown heading, every cited `section` label actually appears in the file.
- **`src/data/loader.ts`** (runtime) — a malformed file surfaces a readable error on the course
  page pointing at `npm run validate:data`, not a blank screen.

The heading check is the one that earns its keep: it means editing a note and renaming a heading
breaks the build instead of silently producing citations that land nowhere.

### Why `heading` vs `section`

A citation may name a `heading` **or** a `section`, never both:

- `heading` — a real Markdown `#` heading. GitHub generates an anchor, so the citation
  deep-links to it.
- `section` — a labelled region that is not a heading. `Ansible.md` numbers its sections as
  ordered-list items and `github_cd-cd.md` marks some with bold text; neither produces an
  anchor. These citations name the region and link to the file.

Without the distinction, roughly a quarter of the citations would have pointed at anchors that
do not exist. The validator rejects a `heading` that is not one, *and* a `section` that actually
is one, so the more precise form is always used where it is available. Heading extraction only
runs for `.md` files — in a source file like `ToolUseExample.py` every `#` comment would
otherwise look like a heading.

### What the gate caught

This is not theoretical. When `building_with_claude_api.md` was rewritten and roughly tripled
in size, the gate failed the build on **18 citations** pointing at headings that no longer
existed (`Accessing the API` → `Accessing the Claude API`, `Handling Tool Results` →
`Returning ToolResults to the Model`, and so on). Re-reading the note against those cards then
surfaced three whose *content* the rewrite had invalidated — the stream-event names had changed
from `MessageStart` to `message_start`/`RawMessageStartEvent`, the evaluation dataset was
redefined as prompt/expected-output pairs, and a claim that the system prompt is "provided once
at the beginning of the session" was contradicted by the new statelessness wording.

A broken anchor is what the machine can detect; it is also a reliable signal that the prose
around it moved, which is the actual reason the check earns its keep.

---

## Rendering the Markdown

Notes and study guides are rendered in-app rather than linked out to GitHub, so `notes/` is
browsable without leaving the site. Three details are easy to break by accident.

**Relative links are rewritten to routes.** A study guide links its notes the way a reader of the
repository would — `../../notes/devops/Ansible.md` — because those links must also work on GitHub.
`resolveHref` turns that into `/notes/devops/Ansible`, which React Router handles as in-app
navigation. Without it every link in every study guide would be a dead file path.

**GitHub alerts are honoured.** The notes use `> [!NOTE]`, `> [!IMPORTANT]` and `> [!WARNING]`
callouts, which GitHub renders natively and `react-markdown` does not. A custom `blockquote`
renderer reads the marker off the first line and lifts the rest into the `Alert` primitive, so a
callout looks the same in the app as on GitHub.

**`NoteRef` objects must be stable.** `src/data/content.ts` builds the list of note refs once at
module load, and that stability is load-bearing rather than an optimisation: `useNote` keys its
effect on the ref it is handed, so a lookup that minted a fresh object per render re-fires the
effect every render and spins forever. The symptom is not a failing test but a hanging one, which
is considerably harder to diagnose — hence the comment on that constant.

---

## Quiz engine

`src/engine/quiz.ts` is a pure reducer over `QuizState`. It has no React, DOM, storage or
styling dependency. The only outside knowledge it needs is the card list, bound once by
`createQuizReducer(cards)`.

This is what makes the UI swappable and the behaviour testable. Notable rules, all covered by
tests in `src/engine/quiz.test.ts`:

- `toggle` is ignored once a card is `revealed` — a graded card is a record, not a form.
- `submit` is ignored unless `canSubmit` passes (≥1 option; exactly 1 for single/boolean).
- `next` only moves from `revealed`, and clears the pending selection.
- Grading is **all-or-nothing**: every correct option chosen and no incorrect one. Partial
  credit would make the accuracy figure misleading, and real exams do not award it.
- Ordering uses a seeded PRNG (`shuffle.ts`), so a session is reproducible — which keeps tests
  deterministic and leaves room for a "resume this session" feature that need only store a seed.

### Adding a mode

`QuizMode` is currently `'practice' | 'review'`, and the mode's only job is to decide which
cards enter the session — the reducer is mode-agnostic. To add one:

1. Extend `QuizMode` in `src/types/quiz.ts`.
2. Filter the card list in `QuizRunner` (`src/components/quiz/QuizRunner.tsx`) for the new mode.
3. Link to it with `?mode=<name>`.

A timed mode additionally needs a `deadline` on `QuizState` and a `tick` action; nothing else
moves.

### Where side effects live

The reducer stays pure, so persistence happens in the component that dispatches:
`handleSubmit` dispatches `submit` **and** calls `progress.recordAnswer`, using the same
`gradeCard` function the reducer uses so the two cannot disagree. Session completion is recorded
in a `useEffect`, not during render.

One subtlety worth preserving: a session's card list and initial marks are captured in
`useState` initialisers, not `useMemo`. The progress snapshot changes identity on every answer,
so a memo would recompute the review list mid-session and cards would vanish from under the
learner the moment they answered one correctly. A session's contents are fixed when it starts.

---

## Progress

`ProgressSnapshot` (`src/types/progress.ts`) is deliberately shaped like a server document
rather than like browser storage:

```jsonc
{
  "schemaVersion": 2,
  "ownerId": "local",              // a real user id once accounts exist
  "updatedAt": 1726660000000,      // merge stamp for future sync
  "courses": {
    "aws/aif-c01": {
      "cards": {
        "embedding-vs-generation": {
          "attempts": 3, "correct": 2, "incorrect": 1,
          "lastResult": "correct", "lastSeenAt": 1726660000000, "marked": false
        }
      },
      "lastSessionAt": 1726660000000,
      "sessionsCompleted": 4
    }
  }
}
```

**Keyed by course, not by card set.** This is the central decision. A card set can be listed in the
`setIds` of more than one course, so the same card can be tested by two certifications — and how
ready you are for one exam says nothing about the other. Keying by set would merge those histories
into one meaningless number; keying by course keeps them independent, so "am I ready for this exam"
is a question the data can answer.

Two bounds on that, both worth knowing before relying on it:

- **Sharing is confined to one domain.** The validator requires every `setIds` entry to be a set in
  the course's own domain, so two courses can share a set only if they sit in the same domain —
  `aws/aif-c01` with `aws/marketplace`, or `devops/ansible` with `devops/github-actions`. A card
  can never be shared between AWS and Anthropic courses. This is also why card ids need only be
  unique per domain rather than globally.
- **Nothing is shared today.** Each of the five courses currently draws on sets no other course
  lists. The keying is what makes sharing safe when it happens, not a description of the present
  catalog.

Counters are monotonic and per-card, which makes the document mergeable: counters add, `marked`
ORs, `lastSeenAt` takes the max, `updatedAt` orders writes. Every mutation is a pure function
over a snapshot (`recordAnswer`, `setMarked`, `completeSession`, `resetCourse`); only
`loadProgress` / `saveProgress` touch `localStorage`.

**Review eligibility** is `marked || lastResult === 'incorrect'`. Answering a card correctly
removes it automatically unless it is still starred, and cards never attempted are excluded —
review is for revisiting, not for discovering.

**Data whose `schemaVersion` does not match is discarded**, not migrated. Progress is regenerable,
and a half-understood document is worse than a clean slate. That is how v1 → v2 was handled: the
key moved from `scribe-cards.progress.v1` to `.v2` and set-keyed documents were simply dropped,
because there is no honest way to redistribute one set's history across the courses that draw on
it. If a future version needs to preserve data, the migration goes in `parseSnapshot`.

`localStorage` failures (private browsing, quota, blocked partitions) degrade to in-memory for the
session rather than throwing.

---

## Styling

Tailwind, configured from the
[CodeScribes Brand Style Guide](https://github.com/hop-along-polly/codescribes-styleguide/blob/main/BRAND_STYLE_GUIDE.md).
Two kinds of token coexist in `tailwind.config.ts` on purpose:

1. **Literal brand hexes** copied from the guide's own Tailwind appendix (`primary`, `parchment`,
   `success`…). Used where the guide names an exact value.
2. **CSS-variable tokens** (`ground`, `surface`, `content`, `line`, `brand`, `ok`, `bad`,
   `warn`, `accent`) whose values flip under `.dark` in `src/styles/index.css`.

The second group encodes the guide's Dark Mode Addendum **once**. Components write
`bg-surface text-content` and never `dark:` colour pairs, so the dark-mode rules cannot drift:
teal lightens on hover in dark mode and darkens in light mode, elevation comes from surface
lightness rather than shadow, and semantic fills become transparent tints.

One deliberate deviation: the guide's semantic indicator hexes (e.g. success `#16A34A`) are
tuned for icons and borders and fall below 4.5:1 as small text on their own light fills. The
`ok-text` / `bad-text` / `warn-text` tokens are darkened in light mode so body copy inside a
feedback panel clears WCAG AA, while the guide's exact values remain in use for icons, borders
and badges. This resolves a conflict between §2 of the guide and its own §8 contrast
requirement.

Theme selection uses the guide's class strategy: an inline script in `index.html` applies the
stored class **before first paint** (so dark mode never flashes white), and `useTheme` only
keeps state in sync afterwards — it must never be the thing that first applies the class.

---

## Accessibility

Choices that would be easy to undo by accident:

- **Options are real `<input type="radio">` / `<input type="checkbox">`**, visually hidden with
  `sr-only` but focusable. This buys native keyboard behaviour — arrow keys within a radio
  group, space to toggle a checkbox — and correct role/checked announcements, with no ARIA of
  our own. The focus ring is drawn on the visual box via `has-[:focus-visible]`.
- **The prompt is a `<legend>`** inside a `<fieldset>`, so the question is announced before the
  options rather than leaving them as an unlabelled list.
- **Focus moves to the feedback panel on submit** (`tabIndex={-1}` + `focus()`), so the verdict
  is where the user lands. Because focus moves, there is deliberately **no `aria-live`** region
  — that would announce the same content twice.
- **Focus moves to `<main>` on every navigation** (`useFocusMainOnNavigate`). Without it a SPA
  leaves focus on the clicked link and keyboard users must tab back through the header.
- **Semantic colour is always paired with an icon and text.** Every `Alert` renders an icon and
  a label; graded options carry an icon plus an `sr-only` verdict sentence.
- **44px minimum tap targets** are real height (`min-h-[44px]`), not an overflowing
  pseudo-element, so a control never swallows a neighbour's taps.
- **`prefers-reduced-motion`** is honoured globally in `src/styles/index.css`.

`src/routes/quiz-flow.test.tsx` asserts on accessible roles and names rather than class names,
so these semantics are covered by tests rather than by convention.

---

## Security note on content rendering

The two content paths have deliberately different trust levels, and the difference is worth
knowing before either is opened to contributors.

**Card JSON cannot inject markup.** `RichText` supports a tiny Markdown subset (fenced code
blocks, inline `` `code` ``, `**bold**`, `*italic*`) and builds React elements directly. There is
no `dangerouslySetInnerHTML` on this path, so a card set accepted from a contributor cannot put
HTML on the page.

**Note Markdown does render inline HTML**, via `rehype-raw` in `MarkdownRenderer`. This is not an
oversight: Markdown has no syntax for a list inside a table cell, and several notes carry their
whole comparison in one GFM table, so those cells use `<ul><li>`. The safety argument is
provenance rather than sanitisation — `notes/` and `courses/` are committed files reviewed like
code, not user input.

That distinction is load-bearing. Accepting card JSON from outside the repository stays safe;
accepting Markdown would need `rehype-sanitize` with an allowlist first.

---

## Tests

| File | Covers |
|---|---|
| `src/engine/quiz.test.ts` | Grading, selection arity, reducer transitions, stats, seeded shuffle |
| `src/storage/progress.test.ts` | Counters, review eligibility, summaries, reset, immutability |
| `src/data/validate.test.ts` | Card and catalog shape rules |
| `src/routes/quiz-flow.test.tsx` | Full flow in jsdom against the **real** card data |
| `src/routes/course-quiz.test.tsx` | A course union session, and that answers are filed under the course with bare card ids |
| `src/routes/content-nav.test.tsx` | Note and course rendering, and relative `.md` links becoming in-app navigation |
| `src/routes/card-links.test.tsx` | That every stretched-link overlay is scoped to its own card |
| `src/routes/domain-empty.test.tsx` | The empty-domain state, against a mocked catalog |

The integration tests drive the actual `flashcards/`, `notes/` and `courses/` files, so they also
prove the catalog, the lazy loaders and the routes agree with each other.

`card-links.test.tsx` exists because of a bug jsdom cannot reproduce. Clickable cards stretch their
link across the whole card with an `absolute inset-0` overlay; `Card` was missing `position:
relative`, so every overlay sized itself to the page, they stacked, and the last card in the DOM
swallowed every click on the grid. jsdom has no layout engine, so a click test passes either way.
The test asserts the invariant the layout depends on instead — each overlay's containing block must
be its own card, holding exactly one overlay — which does fail when `relative` is removed.

The empty-state test is the one exception, and deliberately so: it mocks the catalog rather
than relying on a domain that happens to have no cards. Originally it asserted against the real
AWS domain, which broke the moment AWS notes were added — the code path is permanent, but which
domain is empty today is not.

`vitest.config.ts` is separate from `vite.config.ts` because Vitest bundles its own pinned copy
of Vite and merging the two makes the plugin types collide nominally.

---

## Freemium path

The seams are described in
[README → Planned: the freemium path](README.md#planned-the-freemium-path). In short: progress
is already an account-shaped document behind a single swappable adapter, courses and sets are
already lazily-loaded catalog entries that a `tier` field can gate, and `ProgressProvider` is the
one place an auth provider needs to wrap to swap `ownerId` from `"local"` to a real user.

The course is the natural unit to sell, which the progress model already matches: a purchase grants
a certification, and that is exactly the granularity readiness is tracked at.
