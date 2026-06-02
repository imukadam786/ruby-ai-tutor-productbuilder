# Content-authoring ticket — Afrikaans FAL **Grade 11 (FET)**

Paste this whole file into a fresh Claude Code chat in the `ruby-ai-tutor-productbuilder` repo.

---

## Goal
Author the **Grade 11** Afrikaans FAL content (skill-tree Level 11 + question bank), following the
**exact pattern already used for Grade 10**. Grade 10 is done and validated; Grade 11 mirrors its
structure, chains onto it, and deepens the content. When you finish, run the validator to 0/0 and
stop — engineering + testing happen separately (the engine is generic and already serves new levels).

## Locked decisions (do NOT re-litigate — same as Grade 10)
1. **Tap/MCQ only** — `choice`, `cloze`, `true-false` (full-text Afrikaans options like
   `["Waar","Onwaar"]`), `sequence`. No free text, no `image-match`, no spoken oral.
2. **Immersive FET: `question`, `options`, `ruby_prompt` AND `memo` are ALL in Afrikaans.**
   (Grade 1–6 keep English scaffolding; FET is Afrikaans-only.)
3. **Writing = tappable knowledge** (structure, paragraph order, register, editing, summarising).
   Essay/oral PRODUCTION is deferred.
4. **Literature = generic skills on short ORIGINAL / public-domain Afrikaans passages & poems you write.**
   No prescribed set-works.
5. **20 items per skill** (tutoring-first depth floor). Free tier.

## Source & references (read these first)
- CAPS doc text: `C:\Users\keega\Downloads\Afrikaans_FAL_10-12.txt` — **Grade 11 teaching plan is §3.5.2,
  roughly lines 3263–3854.** (PDF: `CAPS FET _ FAL _ AFRIKAANS GR 10-12 _ WEB_9455.pdf`.) The
  language-structures reference table is §3.4 (~lines 2436–2580); writing text-types §3.3.
- **Templates to copy/adapt** (this is the mechanism — reuse it):
  - `scripts/_g10_tree.mjs` — CRLF-aware inserter that appends a Level object to
    `data/afrikaans-skill-tree.json`.
  - `scripts/_g10_bank_lib.mjs` — helpers `ch/tf/cz/sq/skill/insertSkills` + CRLF-aware bank splicer.
  - `scripts/_g10_taa_a.mjs`, `_g10_taa_b.mjs`, `_g10_lee.mjs`, `_g10_let.mjs`, `_g10_skr.mjs`,
    `_g10_lui.mjs` — per-tier authoring scripts. **Copy these to `_g11_*` and adapt.**
  - Validator: `node scripts/validate-afrikaans-bank.mjs` (must end `0 error(s), 0 warning(s)`).

## Schema (exact — the validator enforces it)
- **Tree** Level object: `{ id: 11, grade: 11, title, description, tiers: [...] }`, each tier
  `{ id, title, description, atomic_skills: [...] }`, each skill `{ id, bank_skill_id, title,
  description, caps_term, prerequisites: [...], templates: [...], error_signatures: [...],
  recovery_strategy, progression }` where `progression` = the practice-through block (copy from any
  Grade 10 skill).
- **Bank** entry keyed by skill id: `{ title, description, grade: 11, strand, skill_ids:[id],
  gate:"NONE", complete_when:"all_items_correct_once", reteach_on_error:true, target_item_count:20,
  caps_term, sensitive:false, templates:[...], recovery_strategy, questions:[...] }`.
- **Item:** `{ ref, question, ruby_prompt?, audio?, context?, input_type, options?, expected, memo,
  error_signals:[...], difficulty:1-3 }`. Rules: `choice`/`cloze`/`true-false` need `options`
  (≥2) and `expected` ∈ `options`; `sequence` → `expected` is the ordered array (and `options`
  carries the same items); `error_signals` non-empty; `ref` unique within a skill; LUI items carry
  `audio` (Afrikaans string); LEE/LET passages go in `context` (poem line breaks as `" / "`).
- **IDs:** `AF.G11.<TIER>.<nn>`; **refs:** `G11<TIER><nn>.xx`. ⚠️ In `_g11_bank_lib.mjs` change
  `grade: 10` → `grade: 11`. In `_g11_tree.mjs` change the dedup guard `'"id": 10,'` → `'"id": 11,'`.

## Cross-grade prerequisites (the chaining)
Each Grade 11 skill must list its **Grade 10 counterpart** as a prerequisite (e.g.
`AF.G11.TAA.04` → `prerequisites: ["AF.G10.TAA.04"]`), plus keep the same intra-tier ordering chain
Grade 10 used. The validator allows prereqs to an EARLIER grade but rejects forward references.

## Grade 11 skill list — mirror Grade 10's 34 skills, deepened
Same 5 tiers, same 34 skills (LUI 4 · LEE 6 · LET 6 · SKR 6 · TAA 12). Keep titles parallel to
Grade 10 but raise the content level per the CAPS Grade 11 plan. **Deltas to bake in:**

- **LUI (Luister, audio):** longer texts incl. a **drama excerpt**; summarise + supply a heading;
  attitude/**tone/tempo/phrasing**; critical listening (bias, assumptions, manipulation).
- **LEE (Lees en kyk):** deeper inference + **evaluation**; paraphrase for summary; writer's attitude
  AND **intention**; visual texts incl. **diagrams/sirkeldiagramme**; richer critical language awareness.
- **LET (Letterkunde):** theme/message; character + **narrator/perspective (verteller)**; plot +
  **time & space (tyd en ruimte)**; beeldspraak (add **metonimia, simboliek**); stylfigure
  (irony, **satire**, hyperbole, contrast, euphemism, climax); poem structure + **taal en styl effek**.
- **SKR (writing knowledge):** add **argumentative/discursive (betogende)** paragraph structure;
  transactional set incl. **CV + covering letter (dekbrief)**, formal **report (verslag)**,
  **agenda + notule**, written **interview/dialogue**, **directions (rigtingaanwysings)**;
  summary by **paraphrase**.
- **TAA (grammar, 12):** noun extensions (versamelname, abstrakte, dubbele meervoude); pronouns
  (betreklik, onbepaald, wederkerend/wederkerig); adjectives + inflection + comparison (incl.
  irregulars); verbs & all three tenses + deelwoorde + infinitief; conjunctions groups 1/2/3 +
  word order; **sentence analysis (sinsdele: onderwerp/gesegde/voorwerp) + sentence types +
  negation**; direct/indirect speech **incl. questions & commands**; **active/passive across ALL
  tenses**; punctuation (extended); semantics (+ polisemie); idioms/proverbs (wider set);
  word-formation & spelling (+ samestellende afleiding, akronieme).

Skew difficulty slightly harder than Grade 10 (more `2`s and `3`s) since these are revision-plus-extension.

## Build steps
1. Copy `_g10_tree.mjs` → `_g11_tree.mjs`; author the Level 11 object (5 tiers, 34 skills, cross-grade
   prereqs, error_signatures, recovery, the practice-through `progression` block). Run it; confirm
   `levels: ...,10,11` and 34 skills.
2. Copy `_g10_bank_lib.mjs` → `_g11_bank_lib.mjs` (set `grade: 11`).
3. Copy each `_g10_<tier>.mjs` → `_g11_<tier>.mjs`; author 20 Afrikaans items per skill. Run each;
   run the validator after each tier. Keep `expected` ∈ `options`, difficulty 1–3, unique refs,
   non-empty `error_signals`.
4. `lib/afrikaans-grade-map.ts`: add `11` to `AVAILABLE_LEVELS` and `GRADE_TO_LEVEL` (`11: 11`); set
   `HIGHEST_AVAILABLE_LEVEL = 11`. (Grades 7–9 + 12 remain the fallback gap.)
5. Update the tree's top-level `description` to mention Grade 11.
6. Final: `node scripts/validate-afrikaans-bank.mjs` → **0 errors / 0 warnings**, coverage shows all
   tree skills authored, depth 20+/skill. `npx tsc --noEmit` clean on the grade-map.

## Acceptance criteria
- Level 11 in the tree: 5 tiers, 34 skills, every G11 skill prereq-chained to its G10 counterpart.
- 34 bank skills × 20 Afrikaans items (≈680), all input types valid, validator 0/0.
- Grade-map maps grade 11 → Level 11; Grades 1–10 routing unchanged.
- **Verify Afrikaans accuracy as you go** (grammar, spelling, idiom meaning) — this is real
  Afrikaans a head-of-ed will review. When done, summarise counts per tier and flag anything
  uncertain for native-speaker review. Do NOT touch the engine or push to prod.
