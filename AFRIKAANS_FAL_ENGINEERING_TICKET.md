# Afrikaans FAL — engineering ticket (paste into a fresh Claude Code chat)

> Open a new Claude Code session **in the `ruby-ai-tutor-productbuilder` repo** and
> paste everything below the line. It is self-contained.

---

You are wiring a new subject — **Afrikaans First Additional Language (FAL), Grades 1–3**
— into this app so learners can actually use it. The **content is already authored**;
your job is the **engineering plumbing only**. Do not author or edit question content.

## What already exists (do not recreate)

- `data/afrikaans-skill-tree.json` — **all 3 grades fully built** (83 atomic skills, 5
  strands per grade, with prerequisite chains). Each skill carries a `progression` block
  (see "Progression model — TUTORING-FIRST" below).
- `data/afrikaans-question-bank.json` — **all 83 skills authored**, each targeting 20+
  items. **Top-level key is `skills`** (keyed by atomic skill id, e.g. `AF.G1.KLK.01`) —
  NOT `topics` like Life Skills.
- `lib/afrikaans-grade-map.ts` — grade→level (1→1, 2→2, 3→3), no placement engine.
- `scripts/validate-afrikaans-bank.mjs` — `node scripts/validate-afrikaans-bank.mjs`
  must stay green after your changes (run it as a smoke test).
- `scripts/afrikaans-image-manifest.md` — image keys for image-match items.

Read those files first to learn the data shapes.

## The one architectural rule that drives every clone decision

Afrikaans FAL is **a language taught to young children (6–9)**. That splits the
templates by what each component does — do NOT clone one subject wholesale:

- **Skill-model pieces** (the tree structure, strands, prerequisite *ordering*, per-skill
  progress): clone **English/reading** for the structure, because the tree has real
  prerequisite chains and a multi-strand view.
  - `components/reading/ReadingSkillTreeView.tsx` for the strand/skill layout — but per
    "Progression model" below, prerequisites only *suggest order*, they never lock.
  - `lib/reading-student-model.ts` for the per-skill progress shape — adapt to the
    tutoring model below (no mastery gate).
- **Item-format pieces** (the player, grading, item selection): clone **Life Skills**,
  because learners tap/choose/listen — they do NOT type free text.
  - `components/life-skills/LifeSkillsSession.tsx` grades choice/true-false/image-match
    deterministically (no LLM rubric judge).
  - `lib/life-skills-selector.ts` selects from a skill-keyed bank.
- Do **not** clone English's `ReadingSession` / `reading-llm-judge` / placement
  calculators — they grade free-text and run a placement test, neither of which
  applies here.

## Question schema (in `data/afrikaans-question-bank.json`)

Each question has: `ref`, `question` (English instruction on screen), `ruby_prompt`
(English voiceover), `audio` (Afrikaans string the engine must **speak aloud** — present
on listening/phonics items), `context` (optional), `image_refs` (optional array of
image keys for image-match, in the same order as `options`), `input_type`
(`choice` | `true-false` | `image-match` | `sequence` | `text` | `cloze`), `options`,
`expected` (must equal one of `options`), `memo` (English explanation shown after),
`error_signals`, `difficulty` (1–3). Pedagogy: **instructions/hints are English,
target content is Afrikaans** — preserve that in the UI.

## Progression model — TUTORING-FIRST (not testing)

The most important behavioural rule: **there is no mastery gate and nothing ever locks.**
Each tree skill carries
`"progression": { "model": "practice-through", "complete_when": "all_items_correct_once", "reteach_on_error": true, "requeue_missed": true, "allow_scaffolding": true, "blocks_progress": false }`
and each bank skill carries `complete_when`, `reteach_on_error`, `target_item_count` (20).

Build the selector + student model so that:
- The learner works through a skill's ~20 items as a practice set.
- A **wrong answer is not a failure**: show the `memo` (the reteach), then **re-queue that
  item** to appear again later in the session. Hints/scaffolding are allowed.
- A skill is **complete** when every item has been answered correctly at least once (help
  allowed) — `complete_when: "all_items_correct_once"`. No streaks, no pass percentage.
- **Every skill is always available.** Prerequisites only set the *recommended* next skill
  / default order; they must NOT lock anything (`blocks_progress: false`). A child must be
  able to reach and work through all the content in their grade.
- The tree view shows per-skill **progress** (items done / "complete"), never a padlock.

(This replaces the earlier correct-streak gate — do NOT build mastery thresholds.)

## Tasks, in dependency order

1. **`types/afrikaans.ts`** — blend the two sources: tree/level/mastery/profile types
   modelled on `types/reading.ts`; bank/question types modelled on `types/life-skills.ts`
   but with the `skills` key and the `audio` + `image_refs` fields above.
2. **`lib/afrikaans-selector.ts`** — clone `lib/life-skills-selector.ts`; read the
   `skills` object (skill id IS the selection key); carry `audio` and `image_refs`
   through to the rendered question.
3. **`lib/afrikaans-student-model.ts`** — adapt `lib/reading-student-model.ts` to the
   tutoring model: persist, per skill, which item `ref`s have been answered correctly and
   which still need re-queuing; mark a skill `complete` when all its items are correct
   once. No mastery gate, nothing locked. (See "Progression model".)
4. **`components/afrikaans/AfrikaansSession.tsx`** — clone `LifeSkillsSession.tsx`. Add:
   (a) play the `audio` Afrikaans string (see "Audio decision" below); (b) render
   image-match from `public/afrikaans/<key>.<ext>` using `image_refs`, falling back to
   the text `options` when an image file is absent.
5. **`components/afrikaans/AfrikaansSkillTreeView.tsx`** — clone `ReadingSkillTreeView.tsx`
   for the layout; render the 5 strands (Luister, Klanke, Woordeskat, Lees & Kyk,
   Taalstruktuur) for the chosen grade. Show per-skill **progress** (items done /
   complete) — **no locked state**; prerequisites only order/highlight the suggested next
   skill. `onPickSkill` opens `AfrikaansSession`.
6. **`types/index.ts`** — add `"afrikaans-fal"` and `"afrikaans-fal-skill-tree"` to the
   `ActiveView` union (line ~18).
7. **`app/page.tsx`** — mirror the Life Skills wiring (currently lines ~27–28 dynamic
   imports, ~129–130 title map, ~373–374 mount). Add dynamic imports for the two new
   components, title entries, and the two `activeView ===` mounts. **Route it FREE like
   `reading`** — do NOT add it to the Scholar/MATRIC gated lists.
8. **`components/SubjectsHub.tsx`** — add an Afrikaans `SubjectCard`. It is **free**, so
   no Scholar badge (unlike the Life Skills tile). Navigate to `"afrikaans-fal"`.
9. **`lib/analytics.ts`** — extend the subject union `"maths" | "reading" | "life-skills"`
   to include `"afrikaans-fal"` (≈11 occurrences).
10. **Supabase** — add a migration allowing `'afrikaans-fal'` in the
    `student_reports.subject` check constraint (follow how `'life-skills'` was added).
11. **`public/thumbnails/afrikaans.png`** — add a thumbnail (placeholder is fine; the
    tile also supports an emoji fallback).

## Audio decision — DECIDED: Afrikaans TTS

Klanke and Luister are audio-first; the `audio` field holds the Afrikaans to speak.
**Build with Afrikaans TTS.** Put it behind a small `speakAfrikaans(text)` helper
(single call site, `lang="af-ZA"`) so recorded clips can replace it later without
touching the components. Pick an Afrikaans (af-ZA) voice; if the chosen TTS provider
has no native af-ZA voice, fall back to a Dutch (nl) voice as the closest match and
leave a TODO. Do not block other steps on audio — but Klanke/Luister are only truly
usable once `speakAfrikaans` works.

## Acceptance criteria

- `node scripts/validate-afrikaans-bank.mjs` → 0 errors.
- App builds/typechecks; an Afrikaans tile appears in the Subjects hub for a **free**
  user and opens the skill tree.
- The tree renders 5 strands for the grade with **every skill openable** (no padlocks);
  each skill shows progress and is marked complete only when all its items have been
  answered correctly at least once.
- A wrong answer shows the reteach (`memo`) and the item returns later in the session — it
  never ends or fails the skill.
- A Klanke/Taalstruktuur session plays: choice/true-false/cloze grade correctly,
  image-match shows pictures when present and English-text options when not.
- Progress persists across reloads (student model) and analytics events fire with
  `subject: "afrikaans-fal"`.

## Gotchas

- Bank key is `skills`, not `topics`.
- No placement engine — `lib/afrikaans-grade-map.ts` self-reports grade → level.
- Keep English scaffolding / Afrikaans target content in the UI.
- All 3 grades are authored; the grade-map sends a learner to their grade's strands.
- Do NOT build a mastery/streak gate — progression is "work through all items with
  reteach"; nothing locks (see "Progression model").
