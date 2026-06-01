# Engineering ticket — add `sequence` (tap-to-order) to the Matric Physical Sciences path

## Why
Physical Sciences derivation / "show that…" items ("Show that μs = tanθ") can't become multiple-choice without gutting them. The right tap interaction is **step-ordering** (`sequence`): the student taps the derivation steps into the correct order. `sequence` already ships in 8 subjects (history, geography, life sciences, etc.) — but the matric path only supports `text | choice | numeric | multiField`, so this is the plumbing to bring the proven pattern across.

## The proven pattern (what we mirror)
- **Data schema** (from history/geography banks): an `items: [{ id, text }]` array + an `expected_order: [ids]` array. **Not** the `options`/`expectedAnswer` shape.
- **Renderer:** `components/geography/SequenceQuestion.tsx` — phone-friendly tap-to-order (tap to place & number, tap to send back, submit when all placed). It serialises the answer as `JSON.stringify(orderedIds)` via `onSubmit(payload)`.
- **Grading:** compare the student's ordered id-array to `expected_order`.

## Two facts that de-risk this
1. The matric grader **already looks up the bank item server-side** by `question_ref` (`skill.items.find(...)`) and scores from the bank, not from client-sent values. So we grade `sequence` against the item's `expected_order` server-side — `expected_order` is never sent to the client, so there's no cheat surface.
2. The bank build script (`scripts/build-matric-phys-sci-bank.mjs`) copies item objects wholesale (it only counts `items`, no field whitelist), so the new `items` / `expected_order` fields flow through with no change. *(Verify once with a converted item.)*

## Work items

| # | File | Change | Size |
|---|---|---|---|
| 1 | `types/matric-phys-sci.ts` | Add `"sequence"` to `MatricPhysSciAnswerMode`. Add `items?: {id:string; text:string}[]` and `expected_order?: string[]` to `MatricPhysSciBankItem`. Add `items?` to `MatricPhysSciGeneratedQuestion` (**not** `expected_order` — keep it server-side). | ~6 lines |
| 2 | `lib/matric-phys-sci-selector.ts` (`itemToGenerated`) | Pass `items` through to the generated question. Do **not** include `expected_order`. | ~2 lines |
| 3 | `app/api/matric-phys-sci/submit-answer/route.ts` | Add `scoreSequence(studentAnswer, expected_order)`: `JSON.parse` the student answer → id array, compare element-by-element to `expected_order` (guard malformed JSON → fail). Add branch: `else if (item.answerMode === "sequence" && item.expected_order) isCorrect = scoreSequence(...)`. | ~12 lines |
| 4 | `components/matric-phys-sci/SequenceQuestion.tsx` (new) + `MatricPhysSciSession.tsx` | Copy geography's `SequenceQuestion` into the matric folder (swap `GeographyItem` for the local `{id,text}` type — that's the only change). Add an `answerMode === "sequence"` block in the session's answer-input section that renders it and routes `onSubmit` to the existing submit handler (same as `choice`). Clear order state on next question. | ~50 lines copied + ~15 wiring |
| 5 | `scripts/build-matric-phys-sci-bank.mjs` | Verify (don't edit) — confirm the new fields survive the rebuild. | 0 lines |
| 6 | Data: `data/matric-physical-sciences-question-banks/L1.T1.A3.json` (+ rebuild) | Convert `L1.T1.A3.q03`: `answerMode: "sequence"`, add `items` + `expected_order`, drop `expectedAnswer`. Steps already drafted in `PHYS_SCI_L1T1_CONVERSION_REVIEW.md`. | ~10 lines data |

## Why copy the component (item #4) rather than share
Generalising geography's component into a shared one is cleaner long-term but edits a file a shipping subject depends on — regression risk for no functional gain here. Each subject already owns its own session; a ~50-line isolated copy keeps blast radius zero. Revisit a shared component only if a third+ subject needs it.

## Order of work & test plan
Types → selector + grader → renderer → convert one data item → test on dev.
- Renders the tap-to-order UI; numbering and send-back work on a phone width.
- Correct order scores pass; any wrong order fails.
- `expected_order` does **not** appear in the network payload to the client.
- Rebuild via `build-matric-phys-sci-bank.mjs` keeps `items`/`expected_order` in the canonical file.

## Effort & payoff
~Half a day. Payoff: unlocks step-ordering for **every** derivation/"show that" item across Physical Sciences (estimate ~20–30 items, ~6% of the 418 — happy to count exactly), letting us apply the agreed "derivations → step-ordering, not typed" rule. After this lands, the residual genuinely-typed set shrinks to open-ended "explain fully / discuss" items only.

## Out of scope
Other tap mechanics (sort-buckets, highlight-source, etc.) for matric — not needed for the conversion programme; revisit only if a future batch calls for them.
