# Architecture

How Scribe Cards is put together, and why. For day-to-day tasks — running it, adding cards,
deploying — see [README.md](README.md).

## The one rule

**Cards are pure data.** The UI never hard-codes a question, an answer, an explanation or a
citation. Everything a learner reads comes from JSON under `data/`, which means adding a
certification is a data-only change and the quiz UI can be replaced without touching content.

Everything below follows from keeping that rule honest.

---

## Layers

```
                    data/catalog.json          data/<domain>/<set>/cards.json
                           │                              │
                           ▼                              ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ src/data/      catalog.ts (eager, tiny)   loader.ts (lazy, per set)  │
  │                validate.ts — shape rules, shared with the build gate │
  └──────────────────────────────────────────────────────────────────────┘
                           │ Card, CardSetMeta, DomainMeta
                           ▼
  ┌────────────────────────────────┐   ┌────────────────────────────────┐
  │ src/engine/                    │   │ src/storage/                   │
  │ grade.ts  — grading a card     │   │ progress.ts — pure updates     │
  │ quiz.ts   — the session reducer│   │   + a localStorage adapter     │
  │ shuffle.ts— seeded ordering    │   │                                │
  │ (no React, no DOM, no storage) │   │ (React-free except the adapter)│
  └────────────────────────────────┘   └────────────────────────────────┘
                           │                              │
                           ▼                              ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ src/hooks/    useCardSet (async)  useProgress (context)  useTheme    │
  └──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │ src/components/ui/     style-guide primitives (Button, Card, Alert…) │
  │ src/components/quiz/   QuestionCard, OptionList, FeedbackPanel       │
  │ src/routes/            Home, Domain, Set, Quiz, NotFound             │
  └──────────────────────────────────────────────────────────────────────┘
```

Dependencies point strictly downward. The engine does not import a component; a component does
not compute a grade.

---

## Data layer

### Two tiers, on purpose

`data/catalog.json` is imported **eagerly**. It is a few hundred bytes per set and carries
everything the index screens need — titles, descriptions, card counts, source files. So the
landing page and domain pages render without fetching a single card.

`data/<domain>/<set>/cards.json` files are discovered by `import.meta.glob` and loaded
**lazily**, which makes Vite emit one chunk per set. A learner studying Ansible never downloads
the Claude API cards. Confirmed in the build output:

```
dist/assets/cards-*.js   13.49 kB   ← agent-skills
dist/assets/cards-*.js   15.88 kB   ← github-cicd
dist/assets/cards-*.js   17.53 kB   ← ansible
dist/assets/cards-*.js   47.71 kB   ← claude-api
```

The trade-off is that a new set must be registered in the catalog *and* exist on disk. That
duplication is deliberate — it buys real loading states and code splitting — and
`npm run validate:data` makes it impossible to get wrong, failing if either side is missing.

### `path` is one identifier wearing three hats

For every set, `path` (e.g. `anthropic/claude-api`) is simultaneously:

- the data directory — `data/anthropic/claude-api/cards.json`
- the route — `/anthropic/claude-api`
- the progress storage key — `snapshot.sets["anthropic/claude-api"]`

The validator asserts `path === "<domainId>/<id>"`, so these can never drift apart. That is why
adding a set needs no route changes.

### Validation runs in two places from one source

`src/data/validate.ts` is dependency-free TypeScript, so the same rules run in:

- **`scripts/validate-data.ts`** (the build gate) — plus the filesystem checks it alone can do:
  catalog ↔ disk agreement, `cardCount` accuracy, every cited note file exists, every cited
  `heading` is a real Markdown heading, every cited `section` label actually appears in the file.
- **`src/data/loader.ts`** (runtime) — a malformed file surfaces a readable error on the set
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
is one, so the more precise form is always used where it is available.

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
2. Filter the card list in `QuizSession` (`src/routes/QuizPage.tsx`) for the new mode.
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
  "schemaVersion": 1,
  "ownerId": "local",              // a real user id once accounts exist
  "updatedAt": 1726660000000,      // merge stamp for future sync
  "sets": {
    "anthropic/claude-api": {
      "cards": {
        "tool-definition-constructs": {
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

Counters are monotonic and per-card, which makes the document mergeable: counters add, `marked`
ORs, `lastSeenAt` takes the max, `updatedAt` orders writes. Every mutation is a pure function
over a snapshot (`recordAnswer`, `setMarked`, `completeSession`, `resetSet`); only
`loadProgress` / `saveProgress` touch `localStorage`.

**Review eligibility** is `marked || lastResult === 'incorrect'`. Answering a card correctly
removes it automatically unless it is still starred, and cards never attempted are excluded —
review is for revisiting, not for discovering.

**Unreadable or future-versioned data is discarded**, not migrated. Progress is regenerable, and
a half-understood document is worse than a clean slate. A real migration goes in
`parseSnapshot` when `schemaVersion` 2 ships. `localStorage` failures (private browsing, quota,
blocked partitions) degrade to in-memory for the session rather than throwing.

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

## Security note on card content

`RichText` supports a tiny Markdown subset (fenced code blocks, inline `` `code` ``, `**bold**`,
`*italic*`) and builds React elements — there is no `dangerouslySetInnerHTML` anywhere. Card
JSON therefore cannot inject markup into the page, which matters if card sets are ever accepted
from contributors.

---

## Tests

| File | Covers |
|---|---|
| `src/engine/quiz.test.ts` | Grading, selection arity, reducer transitions, stats, seeded shuffle |
| `src/storage/progress.test.ts` | Counters, review eligibility, summaries, reset, immutability |
| `src/data/validate.test.ts` | Card and catalog shape rules |
| `src/routes/quiz-flow.test.tsx` | Full flow in jsdom against the **real** card data |

The integration test drives the actual `data/` files, so it also proves the catalog, the lazy
loader and the routes agree with each other.

`vitest.config.ts` is separate from `vite.config.ts` because Vitest bundles its own pinned copy
of Vite and merging the two makes the plugin types collide nominally.

---

## Freemium path

The seams are described in
[README → Planned: the freemium path](README.md#planned-the-freemium-path). In short: progress
is already an account-shaped document behind a single swappable adapter, sets are already
lazily-loaded catalog entries that a `tier` field can gate, and `ProgressProvider` is the one
place an auth provider needs to wrap to swap `ownerId` from `"local"` to a real user.
