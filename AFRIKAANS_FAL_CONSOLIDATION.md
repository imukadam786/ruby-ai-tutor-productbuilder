# Afrikaans FAL — consolidation & handoff (paste into a new Claude Code chat)

> Open a new Claude Code session **in the `ruby-ai-tutor-productbuilder` repo** (branch
> `dev`) and paste everything below the line. It tells you the full state of the Afrikaans
> First Additional Language workstream so you can consolidate what's done vs. what remains
> and keep going. First action: read the files in "Read these first", then run
> `node scripts/validate-afrikaans-bank.mjs` to get the live counts (numbers below are a
> snapshot and will drift as authoring continues).

---

You are picking up **Afrikaans First Additional Language (FAL), Grades 1–3** — a new
Foundation-Phase subject for this app (a CAPS-aligned, tutoring-first language course for
6–9 year olds learning Afrikaans as a second language). Two workstreams run in parallel:
**content authoring** (the skill tree + question bank) and **engineering** (wiring it into
the app). Your job: consolidate the current state, then continue whichever the user asks.

## Locked decisions (do not relitigate)

- **Variant: FAL** (Eerste Addisionele Taal), not Home Language. Source CAPS doc extracted
  to `C:\Users\keega\Downloads\Afrikaans_FAL_1-3.txt`.
- **Free tier** (like English/reading), NOT Scholar-gated like Life Skills.
- **Own skill tree + bank + selector + components** (subject id `afrikaans-fal`).
- **Knowledge-core scope:** five strands delivered — Luister (listening comprehension),
  Klanke (phonics), Woordeskat (vocabulary), Lees & Kyk (reading), Taalstruktuur (grammar).
  **Speaking-aloud and Writing/Handwriting are deferred** (can't be auto-graded on screen).
- **Hybrid architecture** (the key rule): skill-model pieces (tree shape, strands, prereq
  *ordering*, per-skill progress) follow **English/reading**; item-delivery pieces (player,
  grading, selector) follow **Life Skills** (tap/choose/listen, deterministic grading — no
  LLM rubric judge). Pedagogy: **English instructions/hints, Afrikaans target content.**
- **TUTORING-FIRST progression (not testing):** no mastery gate, nothing locks. A skill is
  `complete_when: "all_items_correct_once"` (help allowed); a wrong answer shows the `memo`
  (reteach) and re-queues the item later; prerequisites only suggest order
  (`blocks_progress: false`). Every skill is always reachable.
- **Item depth: 20+ items per skill** (tutoring, lots of practice). Bias new items toward
  **voice (the `audio` field) + tap/choice/image-match**.
- **Audio: Afrikaans af-ZA TTS** behind a `speakAfrikaans(text)` helper (Dutch `nl` voice
  as fallback if no af-ZA voice).

## Read these first

- `data/afrikaans-skill-tree.json` — 83 atomic skills (G1 29, G2 27, G3 27), 5 strands per
  grade, prerequisite chains, each skill has a `progression` block.
- `data/afrikaans-question-bank.json` — the item bank, top-level key `skills` (keyed by
  skill id). Question schema + per-skill fields documented in its `description`.
- `scripts/validate-afrikaans-bank.mjs` — run it; reports coverage + **depth** (skills at
  the 20-item floor). Must stay at 0 errors.
- `scripts/afrikaans-image-manifest.md` — image keys the user must supply for image-match.
- `AFRIKAANS_FAL_ENGINEERING_TICKET.md` — the full engineering plan (per-component clone
  decisions, tutoring progression spec, file-by-file tasks, acceptance criteria).
- `lib/afrikaans-grade-map.ts` — grade→level (1→1, 2→2, 3→3), no placement engine.

## DONE (snapshot — verify with the validator)

- **Tree: all 83 skills built** across G1–G3, 5 strands, prereq chains, tutoring
  `progression` blocks. Validator: 0 errors.
- **Bank: all 83 skills authored** (every skill has items; the *depth* expansion to 20
  items each is in progress — see REMAINING).
- **Tutoring model migrated** across tree + bank + validator + engineering ticket.
- **Content tooling:** grade-map, validator (with depth tracking), image manifest.
- **Engineering (parallel chat, in progress):** `types/afrikaans.ts`,
  `lib/afrikaans-selector.ts`, `lib/afrikaans-student-model.ts`, `lib/afrikaans-audio.ts`,
  `components/afrikaans/`, `app/api/afrikaans/`, `supabase/migrations/015_add_afrikaans_fal_subject.sql`,
  and wiring in `app/page.tsx`, `components/SubjectsHub.tsx`, `lib/analytics.ts`,
  `types/index.ts`. (State varies — check it builds/typechecks.)

## REMAINING

1. **Depth expansion — the main content job.** Bring every skill to 20+ items. As of this
   handoff ~**9/83** are at the floor (all G1 Klanke + all G1 Luister). Going **top to
   bottom**: next is G1 Woordeskat (7), Lees (4), Taalstruktuur (9), then all of G2 (27),
   then G3 (27). Run the validator for the live count and the exact list still below floor.
   - Per-item style: difficulty spread 1→3; reteach-style `memo` (explains *why*);
     voice + tap/choice/image-match; English scaffolding, Afrikaans content.
   - Mechanism: append to each skill's `questions` array (anchor on its last item's `memo`
     + the array close); continue ref numbering (e.g. `WRD02.06`…`WRD02.20`).
   - Image-match items reference `image_refs` keys — add any new keys to the manifest.
2. **Images** — user supplies the picture set per the manifest → `public/afrikaans/<key>.<ext>`.
   Until then image-match items fall back to audio + English-text options.
3. **Audio** — implement/verify `speakAfrikaans()` af-ZA TTS so Klanke/Luister actually speak.
4. **Engineering finish** — complete + verify the tasks in the engineering ticket; ensure
   the app builds, the Afrikaans tile shows for a free user, the tutoring flow works (no
   padlocks, reteach on wrong), progress persists, analytics fire with `subject:"afrikaans-fal"`.
5. **QA pass** — once playable, review items in-context for Afrikaans accuracy + difficulty.

## How to continue

Confirm with the user which workstream they want (content depth-expansion vs engineering),
then proceed. For depth expansion, work top-to-bottom and validate after each strand. Keep
the project memory note (`proj-ruby-afrikaans-fal-1-3`) and this file updated as the source
of truth. Do not author Speaking/Writing content (deferred) and do not add a mastery gate.
