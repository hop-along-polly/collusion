---
name: add-flashcards
description: This skill adds flashcards to the existing set for the specified folder, covering only notes that are not already represented. Existing cards are never modified or removed. If there is nothing new to cover, the skill does nothing and reports that. To rebuild a set from scratch instead, use the "Generate Flashcards" skill.
---

# Add Flashcards

Extends the existing card set for **one notes directory** to cover material that is not already
carded. Purely additive.

**Scope is always a single directory.** Never walk the whole repository in one invocation.

> [!IMPORTANT]
> **Doing nothing is a valid, expected outcome.** If every part of the notes is already covered,
> make no file changes at all and report that. Do not rewrite `cards.json` to reformat it, do not
> reword existing cards, and do not add marginal cards to look productive. This skill is built to
> run repeatedly in CI, where a no-op is the normal result.

## Guarantees

- **Existing cards are never touched.** Not their `id`, `prompt`, `options`, option ids,
  `explanation`, or `citations`. Learner progress is persisted by card id, so editing or
  reordering existing cards corrupts it. New cards are appended to the end of the `cards` array.
- **Only `cards.json` and `data/catalog.json` change**, and in the catalog only `cardCount` and
  `sources`.
- If the set does not exist yet, stop. Report that there is nothing to add to and that
  `generate-flashcards` should be run first. Do not create a set here.

## Invocation

```
/add-flashcards courses/aws/aif-c01
```

With no directory given, do not guess and do not process everything. Ask which directory; in a
non-interactive run, fail with a message listing the directories that contain notes.

## Procedure

### 1. Resolve the target

Read `data/catalog.json` and locate the existing set for this directory, using the resolution
rules in the `generate-flashcards` skill (`.claude/skills/generate-flashcards/SKILL.md`, step 1).
Reuse its `id`, `domainId`, and `path` exactly.

If no set is registered for the directory, stop per [Guarantees](#guarantees) above.

### 2. Find what is not covered

Read every `.md` file in the directory in full, then read the existing `cards.json` in full.
Two signals identify new material, and both should be checked:

**Heading coverage.** Build the list of every substantive heading in the notes, then the set of
headings and sections already named in existing `citations`. Headings with no citation pointing
at them are candidates.

**Git history.** Find what has changed in the notes since the cards were last updated:

```bash
# When the card file was last committed
git log -1 --format=%cI -- data/<path>/cards.json

# Notes touched in the directory since then
git log --since="<that timestamp>" --name-only --pretty=format: -- <notes-dir> | sort -u
```

Changed files matter even when their headings are already cited, because a section can be
substantially expanded under an unchanged heading. Read the actual diff for those files:

```bash
git diff <last-cards-commit>..HEAD -- <notes-dir>
```

Heading coverage alone misses expansions; git history alone misses notes that were never carded
on the first pass. Use both.

### 3. Decide whether there is anything worth adding

Add a card only for material that is **substantive and testable**. Do not add cards for:

- Typo fixes, rewording, or formatting changes that do not change meaning.
- New cross-reference links, or new examples that illustrate an already-carded fact.
- A heading whose content is already fully tested by an existing card under a different heading.

If nothing clears that bar, stop here. Make no changes and report the no-op, naming what you
examined so the run is auditable.

### 4. Check the ceiling before writing

Count existing cards plus planned additions against the **30-60** target in
`ARCHITECTURE.md`.

If the total would exceed 60, do not silently ship an oversized set. Add the highest-value cards
up to 60, then report the overflow and recommend `generate-flashcards` with a deliberate split
along a natural seam. Name the seam you would suggest.

### 5. Author the new cards

Follow the authoring rules in `.claude/skills/generate-flashcards/SKILL.md` — they are the single
source of truth for card quality and are not repeated here. In particular:

- The **Flashcard Guidelines** section: grounding, no "according to the notes" phrasing, never
  all/none of the above.
- The **Question types** table: `single`, `multi`, and `boolean` are the only supported types.
- The **Citations** rules: `heading` for real Markdown headings, `section` otherwise, never both.

Two additional constraints specific to adding:

- **New card ids must not collide** with any existing id in the set. Check before writing.
- **Match the existing set's type mix.** Check the current breakdown and keep the additions
  roughly in proportion, so a set does not drift toward being all True/False over several runs.

### 6. Update `data/catalog.json`

- `cardCount` — set to the new total.
- `sources` — add any note file the new cards cite that is not already listed.

Leave `title`, `subtitle`, `description`, and `id` alone unless the new material genuinely makes
the description wrong, in which case say so in the report.

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
