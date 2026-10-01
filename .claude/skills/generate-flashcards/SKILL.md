---
name: generate-flashcards
description: This skill generates a brand new set of flashcards for the specified note. The new set replaces the old set of flashcards. If you want to add to the existing set of flashcards, use the "Add Flashcards" skill instead.
---

# Generate Flashcards

Builds a complete card set for **one note** from scratch, replacing whatever was there before.

**Scope is one note at a time.** Never walk the whole repository in a single invocation. A note
normally maps to one card set, though a long note may split into two - see
[Set sizing](#set-sizing).

> [!WARNING]
> **This is destructive.** It overwrites the card file and regenerates card ids. Learner progress
> is persisted by card id, so regenerating resets progress for that set. That is intended here.
> To cover newly added material *without* discarding existing cards, use `add-flashcards`.

## Repository layout

Three entities, three directories, one registry. Know all four before starting:

| Path | Holds |
| ---- | ----- |
| `notes/<company>/<note>.md` | The topic notes. The source of truth every card is grounded in. |
| `courses/<company>/<course-id>.md` | A study guide: the topics for one certification or track, linking the notes to read and the card sets that test them. |
| `flashcards/<domain>/<set-id>.json` | Card data, one file per set. |
| `catalog.json` | Repo root. Registers domains, sets and courses, and is what the app loads. |

A note may be read by several courses and a course draws on several sets, so neither
relationship is one-to-one. That mapping lives in `catalog.json`, never inferred from paths.

## Invocation

The caller supplies a note file, relative to the repository root:

```
/generate-flashcards notes/aws/ai_practitioner.md
```

A course file may be given instead, which regenerates every set that course quizzes, one note at
a time:

```
/generate-flashcards courses/aws/aif-c01.md
```

With no argument, do not guess and do not process everything. Ask which note; in a
non-interactive run, fail with a message listing the notes that have no cards yet.

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

These three are the only types the app can render or score. Never invent another `type` value -
`CARD_TYPES` in `src/data/validate.ts` rejects anything else, so it would fail the build.

### Additional prohibitions

Beyond "never all/none of the above":

- **Never** use an option that refers to another option ("Both A and B").
- **Never** write a distractor that is absurd, off-topic, or a joke. Every wrong option must be
  something a reasonable learner could believe - one real answer plus three throwaways tests
  nothing.
- **Never** let the correct option be reliably the longest or most specific one. Length is a
  tell; keep options comparable.
- **Never** write a `multi` card where every option is correct, or where one is correct and the
  rest are trivially wrong. If only one option can be true, it is a `single`.
- Every card must stand alone. No card may depend on the reader recalling a specific sentence,
  variable name, or example from the source note.
- **Never** use an em dash or an en dash, in any field. Write a hyphen, a comma, or a full stop
  instead. These notes are written by practitioners who hold the certifications, and an em dash
  is the clearest signal to a reader that a model wrote the sentence - once they suspect the card
  text is generated, they discount the material behind it. The one exception is a verbatim
  quotation, which keeps the punctuation of its source.

> [!IMPORTANT]
> `src/data/validate.ts` enforces several of these automatically and fails the build. It rejects
> "all/none of the above" options, and it rejects prose that talks *about the source document*
> rather than the subject - phrases like "the notes", "this document", "the material", and
> "the … section" are all caught in `prompt`, `explanation` and option `rationale`.

---

## Procedure

### 1. Resolve the target

Read `catalog.json` first, then work out the domain, the set id and the file path.

| From | Derive |
| ---- | ------ |
| `notes/<company>/…` | `domainId` - the company segment (`aws`, `anthropic`, `devops`) |
| the note's basename | `set id`, kebab-cased (`ai_practitioner.md` → `ai-practitioner`) |
| both | `path` = `<domain>/<set-id>`, so cards land in `flashcards/<domain>/<set-id>.json` |

If a set already covers this note - check every set whose `sources` include it - reuse its `id`,
`domainId` and `path` exactly. **Never rename or renumber an existing set**; the path is a live
URL and the key stored learner progress is filed under.

A note may already be covered by more than one set, either because it was split for size or
because sets are keyed by topic rather than strictly per file. `notes/aws/saas.md` feeds both
`marketplace` and `marketplace-commercials`. When that is the case, regenerate each in turn and
preserve the existing split rather than merging them.

### 2. Read the note completely

Read the file in full. Do not sample, skim, or work from grep output - cards must reflect what
the note actually says, and coverage cannot be judged from fragments.

If the note cites companion files in the same directory (a `.py` or `.ts` example), read those
too. They can only be cited with `section`, never `heading`, because they generate no anchors.

### 3. Plan coverage before writing

List every substantive heading and decide how many cards each deserves, weighted by how much the
note says and how testable the material is, not spread evenly.

Total the plan and settle any [split](#set-sizing) now, before authoring.

### 4. Write the card file

`flashcards/<domain>/<set-id>.json`:

```json
{
  "id": "<set id, matching the catalog>",
  "title": "<set title, matching the catalog>",
  "cards": [ ... ]
}
```

Required per card:

- `id` - kebab-case, named for the concept (`rag-vs-fine-tuning`, not `card-17`), and
  **unique across the whole domain**, not just within the set. See
  [Card ids](#card-ids) below. **Progress is persisted by card id**, so never reuse an id
  for a different question.
- `prompt` - the stem. Supports inline `` `code` `` and `**bold**`.
- `options` - each with a stable `id` (`a`, `b`, `c`, …) and a `rationale`.
- `explanation` - why the key is the key. State the underlying principle rather than "option B is
  correct"; this is the teaching moment.
- `citations` - at least one. See [Citations](#5-citations).
- `tags` - free-form topic tags, expected on every card.

A `rationale` reading only "this is incorrect" is worthless. Say what the option *does* describe,
or what would have to be true for it to be right.

### 5. Citations

Name `file` plus **either** `heading` **or** `section`, never both. `npm run validate:data`
checks both against the real files.

- `file` - the repo-relative note path, e.g. `notes/aws/ai_practitioner.md`.
- `heading` - a real Markdown `#` heading. Copy the text exactly, without the `#` marks. The
  citation deep-links to GitHub's anchor.
- `section` - a labelled region that is *not* a heading (a bold label, a numbered list item).
  Links to the file itself.

Using `heading` for text that is not a heading, or `section` for text that is, fails the build.
Grep the note for the exact string when unsure.

### 6. Register the set in `catalog.json`

A card file on disk that is unregistered, or registered but missing, fails the build.

```jsonc
// sets[]
{
  "id": "ai-practitioner",                      // matches the card file's "id"
  "domainId": "aws",                            // must exist in domains[]
  "path": "aws/ai-practitioner",                // flashcards/aws/ai-practitioner.json
  "title": "AWS Certified AI Practitioner",
  "subtitle": "AIF-C01",                        // optional qualifier
  "description": "...",                         // one or two sentences on coverage
  "sources": ["notes/aws/ai_practitioner.md"],  // every note file any card cites
  "cardCount": 47                               // must equal the card count
}

// domains[] - only when the domain is new
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

### 7. Wire the set into its course

**Do not stop at the set.** A set nothing links to is invisible in the app. For every course
whose study guide links this note:

1. Add the set id to that course's `setIds` in `catalog.json`, in study order. The build fails if
   a `setIds` entry is not a real set in the same domain.
2. Update the **Flashcards** column of the topic table in `courses/<company>/<course-id>.md` to
   link the set at `/<domain>/<set-id>`.

If no course covers the note yet, say so in the report rather than inventing a course. Creating a
course is a deliberate decision about what a learner is studying for.

### 8. Verify

Run both, in order. Do not report success until both pass:

```bash
npm run validate:data
npm test
```

`validate:data` is the gate that stops a card drifting from the note it cites, so a failure
there is a real defect. Fix the card or the citation - never loosen a citation to silence the
gate, and never delete a card to make it pass without saying so in the report.

### 9. Report

State the set path(s), the card count, the type breakdown, which headings drew the most cards,
the course the set was wired into, and anything left uncovered with the reason. If a set came in
under 30 cards, say so explicitly and confirm the note was exhausted rather than leaving the
number unexplained.

---

## Card ids

A card id must be unique within its **domain** - every card file under
`flashcards/<domain>/` - not merely within its own set. `npm run validate:data` fails the
build on a duplicate.

The reason is the storage model. Progress is recorded per course, a course draws only on
sets from its own domain, and a card is stored under its own id with no set prefix. Two
sets in one domain naming a card identically would make one card's history
indistinguishable from the other's.

Ids deliberately carry **no prefix**. A set prefix would orphan a card's history the moment
its set were renamed or split, which is a routine operation - and splitting a long note into
two sets is something this skill does itself.

Checking is one bounded command, not a read of every card in the repository. Run it for the
target domain before writing ids:

```bash
grep -ho '"id": "[^"]*"' flashcards/<domain>/*.json | sort
```

That is a few hundred ids at most. If a name you want is taken, the usual cause is that the
same fact is already carded elsewhere in the domain - check before renaming around it,
because the duplicate content is the real problem.

## Set sizing

A set targets **30-60 cards** (`ARCHITECTURE.md`).

- Under 30 is fine **only** when the note is genuinely exhausted. Never pad with weak or
  duplicate questions to reach the target; report the shortfall instead.
- Over 60 means the note covers two study units. Split along a seam the note already has, give
  each half its own set and its own card file, and list both in the course's `setIds`. A course
  holding several sets is normal - `aif-c01` covers its note with
  `ai-practitioner-foundations` and `ai-practitioner-aws`.
- **Coverage beats count.** Every substantive heading should be represented. A 45-card set that
  ignores three headings has failed.

## Running in CI

- Never prompt. Every decision here has a stated default; apply it and record the choice in the
  report.
- Treat a `validate:data` or `npm test` failure as a hard failure. Never commit a set that does
  not pass.
- Regenerating resets learner progress for the set, so prefer `add-flashcards` for routine note
  updates and reserve this skill for deliberate rebuilds.
