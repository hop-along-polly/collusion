---
name: generate-flashcards
description: This skill generates a brand new set of flashcards for the specified folder. The new set replaces the old set of flashcards. If you want to add to the existing set of flashcards, use the "Add Flashcards" skill instead.
---

# Generate Flashcards

Builds a complete card set for **one notes directory** from scratch, replacing whatever was
there before.

**Scope is always a single directory.** Never walk the whole repository in one invocation. One
certification's notes live in one directory, and one directory maps to one card set — or to a
small number of deliberately split sets, see [Set sizing](#set-sizing).

> [!WARNING]
> **This is destructive.** It overwrites `cards.json` and regenerates card ids. Learner progress
> is persisted by card id, so regenerating resets progress for that set. That is intended here.
> To cover newly added notes *without* discarding existing cards, use `add-flashcards` instead.

## Invocation

The caller supplies a notes directory, relative to the repository root:

```
/generate-flashcards courses/aws/aif-c01
```

With no directory given, do not guess and do not process everything. Ask which directory; in a
non-interactive run, fail with a message listing the directories that contain notes.

---

## Flashcard Guidelines

 - Each cert exam should have 30-60 flashcards but if there's not enough notes to generate that many flashcards, it's ok to have fewer. The goal is to have a comprehensive set of flashcards that cover all of the topics in the notes.
 - Flashcards should be factually grounded in the notes from this repo and should provide citations to the specific notes that were relevant to the flashcard.
 - **DO NOT** use phrases like, "according to the notes", or "The example from the notes" in the queston, answers, or explainations. It's ok to cite the notes but the actual Flashcards should be treated as authoritative.
 - **NEVER** use "All the above" or "none of the above" as an answer.
 - Multiple choice single answer and multipel choice multiple answer (checkboxes) should be the most common types of flashcards. True/False flashcards should be used sparingly.

### Question types

Three types, matching the `CardType` union in `src/types/cards.ts`:

| Guideline name | `type` value | Options | Correct | Notes |
| -------------- | ------------ | ------- | ------- | ----- |
| Multiple Choice | `single` | exactly 4 | exactly 1 | The most common type. |
| Checkboxes | `multi` | 4 to 6 | 1 or more | Prompt ends with `(Select all that apply)`. |
| True/False | `boolean` | exactly 2 | exactly 1 | `True` first, `False` second. Use sparingly. |

Target roughly **55% `single`, 35% `multi`, 10% `boolean`**, which matches "multiple choice most
common, True/False sparingly".

These three are the only types the app can render or score. Never invent another `type` value —
`CARD_TYPES` in `src/data/validate.ts` rejects anything else, so it would fail the build.

### Additional prohibitions

Beyond "never all/none of the above":

- **Never** use an option that refers to another option ("Both A and B").
- **Never** write a distractor that is absurd, off-topic, or a joke. Every wrong option must be
  something a reasonable learner could believe — one real answer plus three throwaways tests
  nothing.
- **Never** let the correct option be reliably the longest or most specific one. Length is a
  tell; keep options comparable.
- **Never** write a `multi` card where every option is correct, or where one is correct and the
  rest are trivially wrong. If only one option can be true, it is a `single`.
- Every card must stand alone. No card may depend on the reader recalling a specific sentence,
  variable name, or example from the source note.

---

## Procedure

### 1. Resolve the target

Read `data/catalog.json` first, then determine the domain id, set id, and data path.

Every note lives at `courses/<company>/<cert-id>/*.md`:

| From | Derive |
| ---- | ------ |
| `<company>` | `domainId` (`aws`, `anthropic`, `devops`) |
| `<cert-id>` | set `id` (`aif-c01`, `claude-api`) |
| both | `path` = `<company>/<cert-id>`, so cards land in `data/<company>/<cert-id>/cards.json` |

If the directory already has a catalog entry, reuse its `id`, `domainId`, and `path` exactly.
Never rename or renumber an existing set — the path is a live URL.

The mapping is usually one directory to one set, but not always: `courses/aws/marketplace/`
feeds both `marketplace` and `marketplace-commercials`. When a directory maps to several
registered sets, regenerate each in turn and preserve the existing split rather than merging
them.

### 2. Read every note completely

Read **all** `.md` files in the target directory, in full. Do not sample, skim, or work from
grep output — cards must reflect what the notes actually say, and coverage cannot be judged from
fragments.

Include non-Markdown files in the directory (`.py`, `.ts` examples) if cards will draw on them.
Those can only be cited with `section`, never `heading`, because they generate no anchors.

### 3. Plan coverage before writing

List every substantive heading across the notes and decide how many cards each deserves,
weighted by how much the notes say and how testable the material is, not spread evenly.

Total the plan and settle any [split](#set-sizing) now, before authoring.

### 4. Write `cards.json`

```json
{
  "id": "<set id, matching the catalog>",
  "title": "<set title, matching the catalog>",
  "cards": [ ... ]
}
```

Required per card:

- `id` — kebab-case, unique in the set, named for the concept (`rag-vs-fine-tuning`, not
  `card-17`). **Progress is persisted by card id**, so never reuse an id for a different question.
- `prompt` — the stem. Supports inline `` `code` `` and `**bold**`.
- `options` — each with a stable `id` (`a`, `b`, `c`, …) and a `rationale`.
- `explanation` — why the key is the key. State the underlying principle rather than "option B is
  correct"; this is the teaching moment.
- `citations` — at least one. See [Citations](#citations).
- `tags` — free-form topic tags, expected on every card.

A `rationale` reading only "this is incorrect" is worthless. Say what the option *does* describe,
or what would have to be true for it to be right.

### 5. Citations

Name `file` plus **either** `heading` **or** `section`, never both. `npm run validate:data`
checks both against the real files.

- `heading` — a real Markdown `#` heading. Copy the text exactly, without the `#` marks. The
  citation deep-links to GitHub's anchor.
- `section` — a labelled region that is *not* a heading (a bold label, a numbered list item).
  Links to the file itself.

Using `heading` for text that is not a heading, or `section` for text that is, fails the build.
Grep the note for the exact string when unsure.

### 6. Register in `data/catalog.json`

A set on disk that is unregistered, or registered but missing, fails the build.

```jsonc
// sets[]
{
  "id": "aif-c01",                              // matches cards.json "id"
  "domainId": "aws",                            // must exist in domains[]
  "path": "aws/aif-c01",                        // directory under data/
  "title": "AWS Certified AI Practitioner",
  "subtitle": "AIF-C01",                        // optional qualifier
  "description": "...",                         // one or two sentences on coverage
  "sources": ["courses/aws/aif-c01/notes.md"],  // every note file any card cites
  "cardCount": 47                               // must equal cards.json length
}

// domains[] — only when the domain is new
{
  "id": "aws",
  "title": "AWS",
  "tagline": "...",          // one line, landing page card
  "description": "...",      // longer, domain page header
  "status": "available",     // or "planned" when no sets exist yet
  "icon": "cloud",           // sparkles | cloud | workflow | terminal
  "order": 3
}
```

### 7. Verify

Run both, in order. Do not report success until both pass:

```bash
npm run validate:data
npm test
```

`validate:data` is the gate that stops a card drifting from the note it cites, so a failure
there is a real defect. Fix the card or the citation — never loosen a citation to silence the
gate, and never delete a card to make it pass without saying so in the report.

### 8. Report

State the set path, the card count, the type breakdown, which headings drew the most cards, and
anything left uncovered with the reason. If the set came in under 30 cards, say so explicitly and
confirm the notes were exhausted rather than leaving the number unexplained.

---

## Set sizing

A set targets **30-60 cards** (`ARCHITECTURE.md`).

- Under 30 is fine **only** when the notes are genuinely exhausted. Never pad with weak or
  duplicate questions to reach the target; report the shortfall instead.
- Over 60 means two study units wearing one name. Split along a natural seam — as
  `AWS Marketplace` split into *Commercials* and *Listing Types* — rather than shipping an
  oversized set. A split means two directories and two catalog entries.
- **Coverage beats count.** Every substantive heading should be represented. A 45-card set that
  ignores three sections has failed.

## Running in CI

- Never prompt. Every decision here has a stated default; apply it and record the choice in the
  report.
- Treat a `validate:data` or `npm test` failure as a hard failure. Never commit a set that does
  not pass.
- Regenerating resets learner progress for the set, so prefer `add-flashcards` for routine note
  updates and reserve this skill for deliberate rebuilds.
