# Engineering ticket — Afrikaans FAL **Grade 10 (FET)** on the dev branch

Paste this whole file into a fresh Claude Code chat in the `ruby-ai-tutor-productbuilder` repo.

---

## Goal

Grade 10 Afrikaans FAL **content** is fully authored and validated. Your job is to make it
**playable and correct on the `dev` branch**, manually test it end-to-end, and report back.
Once Grade 10 is confirmed working in the real app, we will scale the same pattern to Grades 11–12.

This is mostly **verification + small polish**, NOT a big build — the Grade 1–6 engine is generic
and already reads new skills straight from the bank. Do not rebuild it. **Verify every claim below
against the actual code before changing anything; some of it may already be done.**

## What was just added (the content — already on disk, validator 0/0)

- `data/afrikaans-skill-tree.json` — new **Level 10** (`"id": 10, "grade": 10`), 5 tiers, **34 atomic skills**:
  - `AF.G10.LUI.*` (4, Luister — has `audio`), `AF.G10.LEE.*` (6, reading — passages in `context`),
    `AF.G10.LET.*` (6, Letterkunde — passages/poems in `context`), `AF.G10.SKR.*` (6, writing knowledge),
    `AF.G10.TAA.*` (12, grammar).
- `data/afrikaans-question-bank.json` — **680 items** (20 per skill), keyed `AF.G10.<TIER>.<nn>`.
  - **Immersive FET delivery: the `question`, `options`, `ruby_prompt` AND `memo` are all in Afrikaans**
    (Grade 1–6 keep English scaffolding; Grade 10 is Afrikaans-only by product decision).
  - Input types used: `choice` (560), `cloze` (62), `true-false` (50, full-text Afrikaans options
    e.g. `["Waar","Onwaar"]`), `sequence` (8). No `image-match`, no free text.
  - `LUI` items carry `audio` (Afrikaans string for af-ZA TTS). `LEE`/`LET` items carry a reading
    passage / poem in `context`. Poem line breaks are written as `" / "` inside the `context` string.
- `lib/afrikaans-grade-map.ts` — `HIGHEST_AVAILABLE_LEVEL` is now **10**; `AVAILABLE_LEVELS=[1..6,10]`;
  grade 10 → Level 10. **Gap:** grades 7–9 and 11–12 are NOT built and fall back to the nearest built
  level with `beyondContent: true`.
- `components/afrikaans/AfrikaansSkillTreeView.tsx` — notice now shows `seed.level` (the fallback grade).

Run `node scripts/validate-afrikaans-bank.mjs` — expect `0 error(s), 0 warning(s)` and
`coverage: all 200 tree skills authored`, `depth: 200/200 skills at >=20 items`.

## Architecture (already built for Grade 1–6 — confirm, don't rebuild)

The engine is **subject-generic and reads by `skill_id` from the bank**, so it serves Grade 10 with no
data plumbing changes:
- `app/api/afrikaans/generate-question/route.ts` → `getDomainForSkill(skill_id)` +
  `selectQuestion(...)` from `lib/afrikaans-selector.ts`. `getDomainForSkill` just checks
  `bank.skills[skillId]` — **fully data-driven, picks up `AF.G10.*` automatically.** No grade filter.
- `app/api/afrikaans/submit-answer/route.ts` already grades `choice`, `cloze`, `true-false`
  (full-text), and `sequence` (comma-separated order). All four Grade 10 types are covered.
- `components/afrikaans/AfrikaansSession.tsx` already: renders `question.context` (~L456), plays
  `question.audio` via `speakAfrikaans()` (~L445), and handles choice/cloze/true-false (~L592) +
  sequence (~L611).
- `lib/afrikaans-audio.ts` provides the TTS seam (`useAfrikaansTTS` / `speakAfrikaans`).
- `AfrikaansSkillTreeView` renders through the shared `components/shared/SkillTreeShell.tsx` (amber),
  so Level 10 appears automatically.

## Tasks (priority order — verify first, fix only what's actually broken)

1. **Reach Grade 10 in the app.** Onboard / set a profile to **Grade 10**, open Afrikaans, and
   confirm `seedForGrade(10)` lands on Level 10 and the tree renders the 5 new tiers (34 skills).
   - Check the Afrikaans subject is actually offered to a Grade 10 learner: `components/SubjectsHub.tsx`
     (uses `AFRIKAANS_MAX_GRADE` = `HIGHEST_AVAILABLE_LEVEL`, now 10) and the mount/routing in
     `app/page.tsx`. Afrikaans is **free tier** (not behind the Scholar/Matric gate) — keep it that way.
   - Confirm a Grade 7/8/9 or 11/12 learner sees the "More grades coming soon. Here's Grade {n}"
     notice and still gets a playable fallback level (no crash, no Level-1 dump).

2. **Play one skill from every tier and confirm correct behaviour:**
   - `AF.G10.LUI.01` — audio button speaks the Afrikaans `audio`; options are Afrikaans; grading works.
   - `AF.G10.LEE.01` — the `context` **passage renders fully and readably** above the question.
   - `AF.G10.LET.06` — a **poem** in `context`: the `" / "` separators should ideally render as line
     breaks (see task 3).
   - `AF.G10.SKR.03` and `AF.G10.LET.03` — **`sequence`** items: drag/reorder submits and grades right.
   - `AF.G10.TAA.06` — `cloze` + `true-false` (`["Waar","Onwaar"]`) grade correctly.

3. **Passage rendering polish (the one likely real fix).** The `context` block in
   `AfrikaansSession.tsx` was built for short English hints (Grade 1–3). FET passages are full
   paragraphs and poems. Make sure it: wraps/scrolls for long text, has a readable font size, and
   renders poem line breaks. Cheapest correct approach: split `context` on `" / "` and render each
   piece on its own line for poem-style items (or render `\n`). Keep it presentation-only.

4. **Feedback language (DECISION — do not silently change).** `submit-answer` returns English
   praise strings (e.g. "Fantastic! That's correct!"). Grade 1–6 Afrikaans feedback is intentionally
   bilingual and was deliberately left un-localised (documented decision). For the **Afrikaans-only
   FET experience** the product owner may now want Afrikaans feedback for Level 10 items. **Flag this
   and ask before changing** — do not assume.

5. **Regression check Grades 1–6.** Confirm the grade-map change (max 6→10, new fallback logic) did
   not change Grade 1–6 routing: a Grade 3 learner still lands on Level 3, etc. Run `npx tsc --noEmit`
   and the project's lint; `lib/afrikaans-grade-map.ts` type-checks clean today.

## Out of scope
- No new content (the 680 items are done; Gr11/12 come next, separately).
- No free-text grading, no LLM judge, no spoken-oral capture (deferred by design).
- No set-work literature (LET is generic skills on original passages).

## Acceptance criteria
- A Grade 10 profile can open Afrikaans, see Level 10 with all 5 tiers / 34 skills, and play items
  from every tier with correct grading and re-teach (the practice-through model: wrong → show `memo`
  + requeue, nothing blocks).
- Audio plays for LUI; passages/poems render readably for LEE/LET; sequence + true-false + cloze all grade right.
- Grades 1–6 unaffected; `tsc`/lint clean; validator still 0/0.
- A short written report of what already worked vs what you changed, plus the feedback-language
  question answered by the product owner.

## Branch / test
- Work on `dev` (branch from it if needed). Do not push to prod.
- Manual play-test in the running app is required (not just unit checks). Use the `/run` skill or the
  project's dev-server command to launch it, set a Grade 10 profile, and click through the tiers.
- Reference: the original Grade 1–6 brief is `AFRIKAANS_FAL_ENGINEERING_TICKET.md` (same architecture,
  per-component hybrid: English skill-model + Life Skills delivery).
