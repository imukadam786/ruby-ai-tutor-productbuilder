# Life Skills — MCQ-first plan for Foundation Phase

## Why this plan exists

Triggered by a real complaint: a learner answered "warm weather" to a Life Skills question (favourite season) and was marked incorrect. The grader uses **exact string match** on text answers (see `app/api/life-skills/submit-answer/route.ts`), so anything but the model answer fails — even when the question explicitly says "any answer works".

For 5–9 year olds, free-text questions are the wrong format entirely. They:
- Require typing skill the learner doesn't have yet
- Punish creative or partial answers
- Make the grader judge the un-judgeable ("is 'warm weather' the same as 'warm fires in winter'?")

The fix is to convert these open-ended text questions to multiple-choice — same content, picture-and-text choices, no typing.

## The shape of the work

| Stat | Count |
|---|---|
| Topics in the Life Skills bank | 36 |
| Total questions | 600 |
| Already MCQ-style (`choice` + `image-match`) | 451 (75%) |
| `true-false` | 56 |
| `sequence` | 31 |
| **Free-text (`text`) — the target** | **62** |

So three quarters of the bank is already MCQ. The conversion is **62 questions**, not 600. Manageable.

## What "MCQ" should look like for Gr 1–3

- 3 options for Gr 1, 4 options for Gr 2–3
- Each option ≤ 4 words, ideally pictured (emoji or illustration) for non-readers
- One "obviously right" answer, two distractors that are plausible but wrong, one "almost right" (for Gr 2–3)
- No "all of the above" / "none of the above"
- Read-aloud (TTS) must work for both stem and options

## What gets rewritten vs. what stays

### Convert to `choice` (the 62 text questions)
For "any answer works" questions like the seasons example: turn the open-ended prompt into a pick-one. Example:

| Before (text) | After (choice) |
|---|---|
| "Tell me one thing you like about your favourite season." | "Pick one nice thing about summer." → 🏖️ Beach / ☃️ Snowmen / 🍂 Falling leaves / 🌸 Flowers blooming |

For genuinely opinion-style prompts ("how would you feel if…?"), keep them as `choice` with emotion-emoji options (happy / sad / scared / angry).

### Leave alone
- `choice`, `image-match` — already MCQ
- `true-false` — already pick-one
- `sequence` — needs ordering, not typing; works fine
- The grader's `numeric` path — for counting/numbers, typing a number is OK

## Engineering work

1. **No grader changes needed.** `scoreAnswer` already handles `choice` correctly (exact match on option key).
2. **No type changes.** `choice` is an existing supported input type in `types/life-skills.ts`.
3. **Content-only edit.** Rewrite the 62 `text` questions in `data/life-skills-question-bank.json` to `choice` shape: add `options: [{ id, label, emoji?, image? }]` and update `expected_answer` to the right option id.
4. **Validator.** Run `scripts/validate-life-skills-bank.mjs` after the rewrite to confirm the bank stays well-formed.

## Out of scope for this plan

- Grading leniency for older grades (Gr 7+ where text answers might be legitimate)
- Voice answer input
- Image-generation for option illustrations (emoji is enough for v1)

## Owner & timing

- **Content owner**: head of ed authors the 62 rewrites (same workflow as Afrikaans expansions)
- **Engineering owner**: validate-only — no code changes
- **Estimate**: ~1 day of content work + half a day of QA

## Decision point

When this plan is actioned, the grading complaint disappears for Life Skills entirely — there will be no more open-ended questions to mis-grade. If a future complaint shows up around `sequence` or `true-false` grading, those can be addressed separately.
