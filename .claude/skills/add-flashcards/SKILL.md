---
name: add-flashcards
description: This skill adds flashcards to the existing set for the specified note, covering only material that is not already represented. Existing cards are never modified or removed. If there is nothing new to cover, the skill does nothing and reports that. To rebuild a set from scratch instead, use the "Generate Flashcards" skill.
---

# Add Flashcards

Extends the existing card set for **one note** to cover material that is not already carded.
Purely additive.

**Scope is one note at a time.** Never walk the whole repository in a single invocation.

> [!IMPORTANT]
> **Doing nothing is a valid, expected outcome.** If every part of the note is already covered,
> make no file changes at all and report that. Do not rewrite the card file to reformat it, do not
> reword existing cards, and do not add marginal cards to look productive. This skill is built to
> run repeatedly in CI, where a no-op is the normal result.

## Repository layout

| Path | Holds |
| ---- | ----- |
| `notes/<company>/<note>.md` | The topic notes. The source of truth every card is grounded in. |
| `courses/<company>/<course-id>.md` | A study guide: the topics for one certification or track, linking the notes to read and the card sets that test them. |
| `flashcards/<domain>/<set-id>.json` | Card data, one file per set. |
| `catalog.json` | Repo root. Registers domains, sets and courses, and is what the app loads. |

## Guarantees

- **Existing cards are never touched.** Not their `id`, `prompt`, `options`, option ids,
  `explanation`, or `citations`. Learner progress is persisted by card id, so editing or
  reordering existing cards corrupts it. New cards are appended to the end of the `cards` array.
- **Only the card file and `catalog.json` change**, and in the catalog only `cardCount` and
  `sources` — unless a new set has to be created for a split, which is called out below.
- If no set covers the note yet, stop. Report that there is nothing to add to and that
  `generate-flashcards` should be run first. Do not create a set here.

## Invocation

```
/add-flashcards notes/aws/ai_practitioner.md
```

A course file may be given instead, which checks every note that course links, one at a time:

```
/add-flashcards courses/aws/aif-c01.md
```

With no argument, do not guess and do not process everything. Ask which note; in a
non-interactive run, fail with a message listing the notes that have cards.

## Procedure

### 1. Resolve the target

Read `catalog.json` and find every set whose `sources` include this note, using the resolution
rules in `.claude/skills/generate-flashcards/SKILL.md` (step 1). Reuse their `id`, `domainId` and
`path` exactly.

A note may be covered by more than one set. Work out which set new material belongs to by topic,
matching how the existing split was drawn.

If no set covers the note, stop per [Guarantees](#guarantees) above.

### 2. Find what is not covered

Read the note in full, then read the existing card file(s) in full. Two signals identify new
material, and both should be checked:

**Heading coverage.** Build the list of every substantive heading in the note, then the set of
headings and sections already named in existing `citations`. Headings with no citation pointing
at them are candidates.

**Git history.** Find what changed in the note since the cards were last updated:

```bash
# When the card file was last committed
git log -1 --format=%cI -- flashcards/<domain>/<set-id>.json

# Whether the note has changed since then
git log --since="<that timestamp>" --oneline -- notes/<company>/<note>.md

# What actually changed
git diff <last-cards-commit>..HEAD -- notes/<company>/<note>.md
```

Changed content matters even when its heading is already cited, because a section can be
substantially expanded under an unchanged heading. Heading coverage alone misses expansions; git
history alone misses material that was never carded on the first pass. Use both.

### 3. Decide whether there is anything worth adding

Add a card only for material that is **substantive and testable**. Do not add cards for:

- Typo fixes, rewording, or formatting changes that do not change meaning.
- New cross-reference links, or new examples that illustrate an already-carded fact.
- A heading whose content is already fully tested by an existing card under a different heading.

If nothing clears that bar, stop here. Make no changes and report the no-op, naming what you
examined so the run is auditable.

### 4. Check the ceiling before writing

Count existing cards plus planned additions against the **30-60** target in `ARCHITECTURE.md`.

If a set would exceed 60, do not silently ship an oversized set. Two options, in order of
preference:

1. **Split**, if the new material forms a coherent second study unit. Create a second set, give
   it its own card file and catalog entry, and add it to the course's `setIds`. This is how
   `aif-c01` came to hold `ai-practitioner-foundations` and `ai-practitioner-aws`.
2. **Stop at 60** if no clean seam exists. Add the highest-value cards up to the ceiling, then
   report the overflow and recommend `generate-flashcards` with a deliberate split, naming the
   seam you would suggest.

### 5. Author the new cards

Follow the authoring rules in `.claude/skills/generate-flashcards/SKILL.md` — it is the single
source of truth for card quality and they are not repeated here. In particular:

- The **Flashcard Guidelines** section: grounding, no "according to the notes" phrasing, never
  all/none of the above.
- The **Question types** table: `single`, `multi` and `boolean` are the only supported types.
- The **Citations** rules: `heading` for real Markdown headings, `section` otherwise, never both.

Two constraints specific to adding:

- **New card ids must not collide** with any existing id in the set. Check before writing.
- **Match the existing set's type mix.** Check the current breakdown and keep the additions
  roughly in proportion, so a set does not drift toward being all True/False over several runs.

### 6. Update `catalog.json`

- `cardCount` — set to the new total for each set touched.
- `sources` — add any note file the new cards cite that is not already listed.

Leave `title`, `subtitle`, `description` and `id` alone unless the new material genuinely makes
the description wrong, in which case say so in the report.

**If a split created a new set**, also register that set and add its id to the `setIds` of every
course that links this note, then add it to the **Flashcards** column of that course's topic
table in `courses/<company>/<course-id>.md`. A set no course links to is invisible in the app.

### 7. Verify

Run both, in order. Do not report success until both pass:

```bash
npm run validate:data
npm test
```

A `validate:data` failure is a real defect. Fix the card or the citation — never loosen a
citation to silence the gate.

### 8. Report

State the set path, how many cards were added and of which types, the new total, which headings
or diffs prompted them, and anything examined but deliberately skipped with the reason. On a
no-op, say plainly that nothing was added and what was checked.

## Running in CI

- Never prompt. Every decision here has a stated default; apply it and record the choice.
- A no-op must exit successfully. Nothing new to cover is the healthy steady state, not a failure.
- Treat a `validate:data` or `npm test` failure as a hard failure.
- This skill is the right one for routine automated runs. It preserves card ids, and therefore
  learner progress, where `generate-flashcards` resets them.
