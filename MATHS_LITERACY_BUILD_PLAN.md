# Maths Literacy Gr 10–12 — Build Plan

**Status:** Draft for sign-off
**Author:** Claude + Ismail
**Date:** 2026-05-28
**Source:** Full CAPS FET Mathematical Literacy Gr 10–12 (`CAPS FET _ MATHEMATICAL LITERACY _ GR 10-12 _ Web_DDA9.pdf`, 134 pp) + "EDITED" assessment-only CAPS extract (Appendix 3 content matrix) + 8 past papers (P1+P2 May/Jun 2021/2022/2024/2025) + 2026 study guides

---

## 1. Decisions already locked

| Decision | Choice | Rationale |
|---|---|---|
| Placement | New sibling subject "Maths Literacy" | Different matric subject from Maths; clean separation, own pipeline |
| Tier | Paid | Matches Maths and other matric subjects |
| Question depth | 20+ items per atomic skill | Afrikaans FAL pattern — exam-grade drill depth |
| Authoring | Hybrid (Claude drafts, head of ed reviews) | Same model as Gr 7–12 English |
| Past papers | Lift stimuli + memos, re-skin into multiple items | Faster than pure authoring, keeps exam fidelity, copyright check pending |

---

## 2. Subject identity

- **Name:** Maths Literacy
- **Grades:** 10, 11, 12 only (no foundation/intermediate phase)
- **Subject family:** matric subjects (alongside Maths, English, Afrikaans FAL, NST, Social Sciences)
- **Pricing:** paid tier

Maths Literacy is a separate CAPS subject from Maths, not a subset. It focuses on applying maths to real-life contexts — financial documents, plans, statistics — rather than abstract algebra/trig/calculus. The two subjects share almost no atomic skills, so a sibling subject is correct.

---

## 3. Skill tree structure

Mirrors the existing Maths shape exactly:
- **Levels** = topical phase (e.g. "Finance: tariffs, interest, break-even")
- **Tiers** = sub-topic inside a level
- **Atomic skills** = discrete competencies with `prerequisites` linking back through the graph

Each atomic skill carries:
- `id` (format `L#.T#.A#`)
- `title`, `description`
- `prerequisites` (list of atomic IDs)
- `templates` (`stimulus-with-resource` / `symbolic` / `word-context` — adapted for ML)
- `error_signatures` (typed mistakes the engine listens for)
- `recovery_strategy` (what the tutor does when a learner trips)
- `mastery_criteria` (correct_required, formats_required, allow_scaffolding)
- **NEW for ML:** `caps_level` on each question (1/2/3/4 — Knowing / Routine / Multi-step / Reasoning) so exam-style weighting is preserved

### Proposed levels (10 total)

| L | Title | CAPS topic | Grade weight | Why this level |
|---|---|---|---|---|
| 1 | Numbers, calculations & estimation | Basic | Gr10 entry | Foundation for every other level |
| 2 | Patterns, relationships & representations | Basic | Gr10→12 | Tables/graphs/equations used everywhere downstream |
| 3 | Finance: documents, income & budgets | App | Gr10 | First Finance entry — household-scale |
| 4 | Finance: tariffs, interest & break-even | App | Gr11 | Builds on L3, introduces compound thinking |
| 5 | Finance: banking, tax, inflation, FX | App | Gr12 | Highest-stakes Finance content; exam-heavy |
| 6 | Measurement: length, time, conversions | App | Gr10 | Basic measurement skills before composite work |
| 7 | Measurement: perimeter, area, volume, mass | App | Gr10→12 | Composite shapes, dosage, capacity — progresses across grades |
| 8 | Maps, plans & the physical world | App | Gr10→12 | Scale, maps, floor plans, models, assembly |
| 9 | Data handling | App | Gr10→12 | Full data cycle: collect → organise → summarise → represent → interpret |
| 10 | Probability | App | Gr10→12 | Single events, combined, fair/unfair games |

### Tier breakdown (preview)

Full tier list will be in the JSON. Sample for L5 to show shape:

```
L5 — Finance: banking, tax, inflation, FX
  T1 Banking (fees, statements, account types)
  T2 Loans & investments (repayment, compound interest in context)
  T3 Taxation (PAYE, UIF, tax brackets, tax pocket guide)
  T4 Inflation
  T5 Exchange rates (foreign travel, imports)
```

### Atomic skill estimate

| Level | Tiers | Atomic skills | Why |
|---|---|---|---|
| L1 Numbers | 5 | 14 | High coverage — used by every other level |
| L2 Patterns/representations | 4 | 12 | Tables/graphs/equations |
| L3 Finance: documents | 4 | 14 | Wide variety of documents |
| L4 Finance: tariffs/interest | 4 | 16 | Compound interest needs many sub-skills |
| L5 Finance: banking/tax/inflation/FX | 5 | 22 | Heaviest exam topic (35% weighting) |
| L6 Measurement: basics | 4 | 12 | Length, time, conversions, temperature |
| L7 Measurement: composite | 5 | 18 | Perimeter/area/volume/surface area/dosage |
| L8 Maps/plans | 4 | 14 | Scale, maps, plans, models |
| L9 Data handling | 5 | 20 | Full data cycle is granular |
| L10 Probability | 4 | 10 | Smallest exam weight |
| **Total** | **44** | **~152** | Comparable to Maths (83) — denser because ML is contextual |

### Prerequisite graph (high level)

```
L1 (Numbers) ──┬──> L3 ──> L4 ──> L5    (Finance chain)
               ├──> L6 ──> L7           (Measurement chain)
               ├──> L8                  (Maps/plans)
               ├──> L9 ──> L10          (Data → Probability)
               └──> L2 (Representations, used by all above)
L2 (Patterns) ──> L3, L4, L5, L7, L8, L9
```

ML topics are less deeply chained than Maths (no Gr1→Gr12 ladder). L1 and L2 gate the application topics; the application topics are mostly independent of each other.

---

## 4. Question bank

### Volume target

- **20+ items per atomic skill** (Afrikaans FAL depth)
- ~152 skills × 20 = **~3,040 items minimum**
- Heavier coverage on exam-weighted topics:
  - L5 Finance: 22 skills × 25 = ~550 items
  - L9 Data: 20 skills × 25 = ~500 items
  - L7 Measurement: 18 skills × 22 = ~400 items
- **Estimated total: ~3,500 items**

### Sourcing strategy per grade-topic

Per CAPS Section 2.5 work schedule (full doc, not the edited version):

| Grade-Term | Topics taught | Sources | Notes |
|---|---|---|---|
| **Gr 10 Term 1** | Numbers; Patterns; Measurement (Conversions, Time) | CAPS only | No paper coverage for Gr 10 |
| **Gr 10 Term 2** | Finance (Documents, Tariffs); Measurement (length/weight/volume/temp); Maps (Scale, Maps); Probability | CAPS only | |
| **Gr 10 Term 3** | Finance (Income/expenditure/budgets); Measurement (Perimeter, area, volume); Maps (Models, Plans) | CAPS only | |
| **Gr 10 Term 4** | Finance (Interest, Banking, Taxation); Data handling | CAPS only | |
| **Gr 11 Term 1** | Patterns; Measurement (Conversions, Time); Finance (Documents, Tariffs, Income/expenditure, Cost/selling, Break-even) | CAPS only | |
| **Gr 11 Term 2** | Finance (Interest, Banking, Inflation); Measurement (length/weight/volume/temp); Maps (Scale, Maps) | CAPS only | |
| **Gr 11 Term 3** | Measurement (Perimeter, area, volume); Maps (Models, Plans); Finance (Taxation); Probability | CAPS only | |
| **Gr 11 Term 4** | Finance (Exchange rates); Data handling | CAPS only | |
| **Gr 12 Term 1** | Measurement (Conversions, Time); Finance (Documents, Tariffs, Income/expenditure, Cost/selling, Break-even); Data handling | **CAPS + past papers + 2026 prep** | Mid-year exam scope — lift + re-skin available |
| **Gr 12 Term 2** | Finance (Interest, Banking, Inflation); Maps (Scale, Maps); Measurement (length/weight/volume/temp, perimeter/area/volume) | **CAPS + past papers + 2026 prep** | Mid-year exam scope — lift + re-skin available |
| **Gr 12 Term 3** | Finance (**Taxation, Exchange rates**); Maps (**Plans, Models**); **Probability** | CAPS only | **Post-June** — no May/Jun paper coverage; examined in trial + November final |
| **Gr 12 Term 4** | Revision only | n/a | |

**Key insight:** Past-paper lift-and-re-skin only applies to Gr 12 Terms 1–2 topics. That is roughly:
- Finance: Documents, Tariffs, Income/expenditure, Cost/selling, Break-even, Interest, Banking, Inflation ✅
- Finance: **Taxation, Exchange rates** ❌ (Term 3)
- Measurement: all ✅
- Maps: Scale and Map work ✅; **Plans, Models** ❌ (Term 3)
- Data handling ✅
- **Probability** ❌ (Term 3)

CAPS is the canonical scope source for everything.

### CAPS taxonomy mix per skill (per item, tagged `caps_level`)

| CAPS level | Description | Target % per skill |
|---|---|---|
| L1 Knowing | Reproduce a fact / read a value | 30% |
| L2 Routine procedures | Apply a known method in a familiar context | 30% |
| L3 Multi-step procedures | Combine methods across a context | 25% |
| L4 Reasoning & reflecting | Justify, critique, decide | 15% |

Matches CAPS Table 7 (overall allocation Paper 1 + Paper 2 combined).

### Item schema (mirrors `maths-question-banks/N.json`)

```json
{
  "id": "L5.T3.A2.q07",
  "skill": "L5.T3.A2",
  "caps_level": 3,
  "stimulus": "tax-bracket-table-2024.png OR inline markdown table",
  "question": "Calculate the annual PAYE for Thandi who earns R34 500 per month.",
  "answerMode": "numeric",
  "expectedAnswer": 63270,
  "tolerance": 100,
  "workingSteps": ["Annual = 34500 × 12 = 414000", "Bracket: 226001–353100 ⇒ 40680 + 26% above 226000", "..."],
  "errorSignals": ["ERR_TAX_BRACKET_WRONG", "ERR_MONTHLY_NOT_ANNUALISED"],
  "passThreshold": 0.85,
  "source": "P1 May-Jun 2024 Q3.2 (re-skinned)"
}
```

### Bank layout on disk

```
data/maths-literacy-question-banks/
  L1.T1.A1.json
  L1.T1.A2.json
  ...
  L10.T4.A3.json
  _stimuli/                  ← shared images (tax tables, plans, statements, maps)
  _prompts/                  ← Claude authoring prompts per skill
```

Per-skill files (not numeric N.json) because skill IDs make routing simpler when we have 150+ skills.

---

## 5. Past-paper integration ("lift + re-skin")

### Scope of applicability

Past papers in Downloads are all Gr 12 May/Jun (mid-year) exams. Per CAPS Section 2.5 work schedule, mid-year exams cover Gr 12 Terms 1–2 only — meaning past papers contribute zero to Gr 10, zero to Gr 11, and zero to Gr 12 Term 3 (Taxation, Exchange rates, Plans, Models, Probability).

The other roughly 75% of the build is CAPS-only authoring.

### What we lift wholesale (Gr 12 Terms 1–2 only)

- **Stimuli** — bank statements, tariff tables, floor plans, maps, salary slips, electricity bills, demographic tables, weather charts. These already sit in Downloads as ~100+ cropped PNGs.
- **Marking memos** — expected answers, working steps, acceptable variations. From the marking guideline PDFs.
- **Coverage signal** — frequency of each skill across past papers tells us where the 25/skill density pays off most for Gr 12 mid-year.

### What we author fresh

- **All of Gr 10 and Gr 11** — CAPS-only, no paper source
- **All of Gr 12 Terms 3–4** — CAPS-only, no paper source
- **Post-June curriculum additions for any grade** — CAPS-only
- Items that wrap lifted stimuli (one electricity bill → 6 fresh questions at varying CAPS levels)
- Items for skills past papers underweight even within Gr 12 mid-year scope
- L1 Knowing items across all grades (past papers contain few isolated knowledge probes)

### Process per past paper

1. Extract questions + memos → CSV row per sub-question
2. Tag each row to an atomic skill (`L#.T#.A#`)
3. Lift stimulus into `_stimuli/` with stable filename
4. Author 4–6 sibling questions per stimulus across CAPS levels
5. Validate against memo
6. Head-of-ed review

### Copyright

DBE past papers are reproducible for educational use in SA but commercial subscription product is a different licensing question. **Action item before bank ships:** confirm reproduction rights with someone who knows IP law in SA ed-tech. Not a blocker for authoring — a blocker for shipping.

---

## 6. Engineering surface

**Scaffolding cloned from NST / Social Sciences. Specific components ported from Maths.**

Maths is the OG subject in this codebase and uses a pre-pattern legacy architecture: hosted under `components/ruby/`, skill tree at unprefixed `data/skill-tree.json`, API under `app/api/ruby/`, generic `lib/student-model.ts`. Every subject built since (Life Skills, Afrikaans, NST, Social Sciences) deliberately moved to a prefixed sibling pattern. Maths Literacy should follow the modern pattern, not inherit the legacy.

### What to port from Maths (not clone)

Maths has working solutions for problems Maths Lit will hit. Port these as references, adapted to the prefixed pattern:

| From Maths | Why useful for ML | Port target |
|---|---|---|
| `MathsDiagnosticPlacement.tsx` + `lib/maths-placement-engine.ts` | ML needs a grade-aware diagnostic on subject entry (Open decision #5) | `components/maths-literacy/MathsLiteracyDiagnosticPlacement.tsx` + `lib/maths-literacy-placement-engine.ts` |
| `components/ruby/QuestionCard.tsx` + `FeedbackCard.tsx` | Handle working steps, multi-field answers, numeric tolerance — ML needs all three | Adapt into `components/maths-literacy/` (shared shape, ML-specific copy/styling) |
| `components/ruby/DotArray.tsx` | Visual stimulus component | Probably not reused — ML stimuli are bills/plans/maps, not dot arrays |

### Files to create

| Path | Purpose |
|---|---|
| `data/maths-literacy-skill-tree.json` | Skill tree (10 levels, ~44 tiers, ~152 atomic skills) |
| `data/maths-literacy-question-banks/*.json` | Per-skill question banks |
| `data/maths-literacy-question-banks/_stimuli/*.png` | Shared image stimuli |
| `app/api/maths-literacy/generate-question/route.ts` | Pull next question for a learner |
| `app/api/maths-literacy/submit-answer/route.ts` | Score answer, update mastery |
| `components/maths-literacy/MathsLiteracySession.tsx` | Learner-facing session UI (clone from NST) |
| `components/maths-literacy/MathsLiteracySkillTreeView.tsx` | Skill-tree picker (clone from NST) |
| `components/maths-literacy/MathsLiteracyDiagnosticPlacement.tsx` | Grade-aware diagnostic on entry (port from Maths) |
| `components/maths-literacy/QuestionCard.tsx` + `FeedbackCard.tsx` | Working steps, multi-field, tolerance (port from Maths) |
| `lib/maths-literacy-grade-map.ts` | Grade → level/tier mapping (clone from NST) |
| `lib/maths-literacy-selector.ts` | Next-skill selection logic (clone from NST) |
| `lib/maths-literacy-student-model.ts` | Mastery/state tracking (clone from NST) |
| `lib/maths-literacy-placement-engine.ts` | Diagnostic scoring → starting level (port from Maths) |

### Files to edit

| Path | Change |
|---|---|
| `app/page.tsx` | Register `maths-literacy` and `maths-literacy-skill-tree` views |
| `components/ProgressTracker.tsx` | Add ML skill-tree import for progress display |
| `supabase/` migrations | Add ML mastery table if schema is per-subject |

---

## 7. Diagrams & images

Same pattern as Afrikaans — diagram pipeline is deferred while the JSON content gets built first.

- **Phase 1 (now):** lifted past-paper PNGs in `_stimuli/` used as-is
- **Phase 2 (later):** rebuilt as native SVG / accessible alt text — out of scope for this plan

---

## 8. Phasing

| Phase | Deliverable | Effort | Done when |
|---|---|---|---|
| 0 | Skill tree spec sign-off | 1 day | Head of ed signs off on the 10 levels + tier list |
| 1 | `maths-literacy-skill-tree.json` authored | 3–4 days | All ~152 atomic skills, prereqs, error signatures, mastery criteria — validator green |
| 2 | Pilot bank — L4 Finance (Tariffs, Interest, Break-even) | 1 week | ~400 items authored + reviewed; tests the lift+re-skin pipeline end-to-end. **Switched from L5 to L4** because L4 is wholly Gr 11/12 Terms 1–2 (past papers have heavy coverage for every sub-topic), whereas L5 mixes Term 2 (Banking, Inflation — papers exist) with Term 3 (Taxation, FX — no paper coverage) |
| 3 | Engineering surface (routes, components, lib, page.tsx wiring) | 2–3 days | Learner can sit a Maths Lit session against L5 |
| 4 | Bank build — remaining 9 levels | 3–4 weeks | ~3,000 more items authored + reviewed |
| 5 | Past-paper coverage audit + gap-fill authoring | 1 week | Every skill ≥ 20 items, every CAPS level ≥ target % per skill |
| 6 | Head-of-ed final review + sign-off | 1 week | All banks marked CLEAN |
| 7 | Copyright sign-off on lifted stimuli | parallel | IP review complete |

**Total estimated calendar time: 6–8 weeks** (assuming hybrid authoring and one head-of-ed reviewer working in parallel).

---

## 9. Risks & open questions

| Risk / question | Mitigation |
|---|---|
| Copyright on lifted DBE stimuli for a paid product | IP sign-off in parallel with Phase 4; can be resolved before launch |
| Past-paper stimuli are PNGs (not text) — hosting + accessibility | Phase 1 uses PNGs; Phase 2 (post-launch) rebuilds as native components |
| Schema mismatch between past-paper multi-part format and our one-item-per-row bank | Splitting is part of the lift process — costed into Phase 2 pilot |
| Some skills under-tested in past papers (L1, L2 drills) | Phase 5 gap-fill authoring; coverage audit catches these |
| **Past papers cover Gr 12 mid-year scope only** — Gr 10, Gr 11, and Gr 12 Terms 3–4 have no paper source | Authoring volume is higher than the lift+re-skin shortcut suggests; ~50% of the build is pure CAPS authoring. Phase 4 effort estimate accounts for this. |
| **Post-June curriculum additions** that papers don't cover but CAPS does | CAPS doc is authoritative; coverage audit (Phase 5) cross-checks every CAPS section against the bank, flagging any topic that exists in CAPS but not in the bank — paper presence is irrelevant to that check |
| Head-of-ed review bandwidth on ~3,500 items | Review per level as Phase 4 progresses, not as one block at end |
| CAPS L4 (Reasoning & reflecting) items are hard to author at scale | Lean heavily on past-paper L4 questions for these; supplement sparingly |

---

## 10. Open decisions for you

Things I'd want your call on before Phase 1 starts:

1. **Validator** — should the ML skill tree run through the same `scripts/` validator as Afrikaans/Maths, or do we need an ML-specific one (e.g. CAPS taxonomy distribution check per skill)?
2. **`caps_level` enforcement** — should the question selector use `caps_level` mix per session (e.g. always show 60/35/5 like Paper 1), or just store it for analytics?
3. **Stimulus reuse** — when one stimulus (e.g. a tax table) is referenced by 8 questions across 3 skills, do all 8 questions share one PNG path, or do we duplicate? (Recommend share — cleaner.)
4. **Onboarding placement** — does ML get its own diagnostic on subject entry, or does it inherit the Maths placement diagnostic? (Recommend its own — content is too different.)
5. **Grade mapping** — should the learner pick "Gr 10 / Gr 11 / Gr 12" on entry and the selector filter to grade-appropriate tiers, or should it always present from L1 and let mastery surface the right level? (Recommend grade-aware entry — matric learners want their grade, not foundation work.)

---

## Next step

Sign off on the level/tier breakdown (Section 3) and the open decisions (Section 10). Once those are locked, I can draft `data/maths-literacy-skill-tree.json` (Phase 1) for review.
