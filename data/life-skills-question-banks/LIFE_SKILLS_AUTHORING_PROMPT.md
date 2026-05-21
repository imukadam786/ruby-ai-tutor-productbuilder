# Life Skills authoring prompt (for Claude)

This prompt is a **template**. The head of education fills in the five `{{VARIABLES}}` for one topic at a time and pastes the result into Claude. Claude returns JSON that drops directly into the topic's bank file at `questions[]`. The validator (`scripts/validate-life-skills-bank.mjs`) then checks the result.

Run once per topic — 36 runs to cover Grades 1–3 fully.

---

## The variables you fill in

| Variable | Where to find it | Example |
|---|---|---|
| `{{TOPIC_ID}}` | `data/life-skills-skill-tree.json` → atomic_skills[].id | `LS.L1.BKH.T01` |
| `{{GRADE}}` | First digit after `L` | `1` |
| `{{TOPIC_TITLE}}` | atomic_skills[].title | `Me and my body` |
| `{{TARGET_COUNT}}` | **15** for Grades 1 & 2 · **20** for Grade 3 | `15` |
| `{{IS_SENSITIVE}}` | `true` for L1.T11, L2.T08, L3.T05, L3.T11 — `false` otherwise | `false` |
| `{{CAPS_CONTENT}}` | CAPS doc bullets for this topic (from `Life_Skills_flow.txt` in Downloads, or paste from the PDF directly) | (multi-line bullet list) |

---

## The prompt (copy everything below the line into Claude)

---

You are authoring assessment items for **Ruby AI Tutor**, a South African primary-school adaptive learning platform that follows the **CAPS** (Curriculum and Assessment Policy Statement) curriculum. You are producing items for **one specific topic** in the Foundation Phase Life Skills subject (Grades 1–3).

## Audience

- South African Foundation Phase learners, ages 6–9.
- Many are pre-readers or early readers — Grade 1 cannot reliably read multi-clause sentences.
- All text will be **read aloud** by text-to-speech, so write items as if they will be heard, not read. Keep sentences short and concrete. Avoid idioms and complex syntax.
- Items render on **mobile and desktop** with audio playback and large touch targets.
- Cultural context is **South African**: use South African place names, Rand currency, indigenous animals (springbok, ostrich), local foods (pap, biltong, samp), local seasons (summer = December–February). Avoid US/UK-specific references.

## Topic being authored

- **Topic ID:** `{{TOPIC_ID}}`
- **Grade:** {{GRADE}}
- **Topic title:** {{TOPIC_TITLE}}
- **Items to author:** {{TARGET_COUNT}}
- **Sensitive content flag:** {{IS_SENSITIVE}}

## CAPS content for this topic (authoritative — do not invent content beyond this scope)

{{CAPS_CONTENT}}

## How to author

### Coverage

Distribute the {{TARGET_COUNT}} items across the CAPS content bullets above. Every bullet should be covered by at least one item; the longer or more central bullets get 2–3 items.

### Difficulty distribution

- ~30% easy (recall, naming, identifying) — `difficulty: 1–2`
- ~50% medium (classification, applying a rule, simple sequence) — `difficulty: 3`
- ~20% hard (reasoning, scenario, "why" or "what would you do" questions) — `difficulty: 4–5`

### Question types (`input_type` values)

Use a mix. Do not use any single type for more than half the items.

- **`choice`** — multiple-choice with 3 or 4 short text options. Most common. Good for naming, classification, scenarios. Use this as your default.
- **`image-match`** — pick which image matches the question. Use when the answer is naturally visual ("Which one is a healthy snack?"). In `context`, describe the four images verbally (`"Picture: apple, sweet, chips, biscuit"`) so the engineering team can source matching images later.
- **`sequence`** — drag items into the correct order. Good for processes (washing hands, growing a plant, day-night). Provide the items as `options[]`; `expected` is the correct order as a comma-separated string.
- **`true-false`** — simple sanity checks. Use sparingly (at most 2 per topic).
- **`text`** — short oral answer transcribed by speech-to-text. Use for open-ended prompts like "Name one person who helps your community." `expected` is a representative correct answer; the AI will judge semantic match.

### Sensitive-topic guidance (only applies if `{{IS_SENSITIVE}}` is `true`)

This topic touches on emotionally heavy content (bullying, abuse, grief, HIV/AIDS, self-esteem, emotional regulation). For these items:

- **Avoid right/wrong framing for feelings.** Feelings aren't wrong. Frame items around *actions* and *help-seeking*, not "the correct emotion to have."
- **Always include a "trusted adult" path** in the correct answer when the topic involves harm. Example: "If someone touches you in a way that feels wrong, what should you do?" → correct: "Tell a parent or teacher I trust."
- **Avoid graphic detail.** Refer to harm in age-appropriate language. Never describe abuse explicitly.
- **Make `memo` supportive**, not corrective. Reinforce that talking to a parent, teacher or counsellor is the right move.
- Lean toward `text` and `choice` input types for scenarios; avoid `true-false` here.

### Each item must include

| Field | Type | Description |
|---|---|---|
| `ref` | string | Unique within this topic. Format: `T{NN}.{II}` where NN = topic number (e.g. 01–12), II = item number (01, 02, …). |
| `question` | string | What the learner sees and hears. Short, concrete, age-appropriate. |
| `ruby_prompt` | string | How Ruby (the tutor character) frames the question warmly. May be the same as `question` or a friendlier version. |
| `context` | string (optional) | For `image-match`, describe the images. For other types, can hold a scenario setup. |
| `input_type` | string | One of: `choice`, `image-match`, `sequence`, `true-false`, `text`. |
| `options` | string[] | Required for `choice`, `image-match`, `sequence`. 3–4 entries typical. |
| `expected` | string | The correct answer. For `choice`/`image-match` it's the correct option's text. For `true-false`, `"true"` or `"false"`. For `sequence`, comma-separated correct order. For `text`, a representative correct answer (AI judges semantic match). |
| `memo` | string | One or two sentences explaining *why* the correct answer is correct, plus a brief note on what a learner who picked a wrong answer probably misunderstood. This is what Ruby shows the learner after a wrong answer. |
| `error_signals` | string[] | 1–3 codes from the list below describing the *types of error* a learner might make on this item. |
| `difficulty` | number 1–5 | 1 = easiest, 5 = hardest. |

### Error signal codes

Use these. If you need a new one for this topic, prefix it with `ERR_LS_` and document it in the memo.

- `ERR_LS_FACT` — factual recall error (wrong name, wrong number, wrong identification)
- `ERR_LS_CLASS` — classification mistake (e.g. put a domestic animal under wild)
- `ERR_LS_SEQ` — wrong order in a sequence task
- `ERR_LS_SAFETY` — chose an unsafe action in a danger scenario
- `ERR_LS_EMPATHY` — emotional/social mis-step (mainly for sensitive topics)
- `ERR_LS_CONTEXT` — applied right concept in wrong context
- `ERR_LS_VOCAB` — misunderstood a key word in the question

Each item must list **1–3** codes that genuinely describe the wrong-answer paths for *that specific item*.

## Output format

Return **a single JSON object** with exactly this structure. Do not include explanations, commentary, markdown headers, or any text outside the JSON object.

```json
{
  "items": [
    {
      "ref": "T01.01",
      "question": "Which one helps your body grow strong?",
      "ruby_prompt": "Let's think about food. Which one helps your body grow strong?",
      "context": "Picture: apple, sweet, chips, biscuit",
      "input_type": "image-match",
      "options": ["Apple", "Sweet", "Chips", "Biscuit"],
      "expected": "Apple",
      "memo": "Apples are a fruit and give your body vitamins to grow strong. Sweets, chips and biscuits have a lot of sugar or salt and don't help your body grow.",
      "error_signals": ["ERR_LS_FACT", "ERR_LS_CLASS"],
      "difficulty": 1
    }
  ]
}
```

Produce **{{TARGET_COUNT}} items total.** Vary the question types and difficulties as described above. Cover every CAPS content bullet. Stay strictly inside CAPS scope — do not introduce content the curriculum does not specify.

---

## After Claude returns the JSON

1. Open the matching bank file: `data/life-skills-question-banks/{{TOPIC_ID}}.json`.
2. Paste the items from the returned `items` array into the bank's `questions` array (replace the empty `[]`).
3. Run the validator: `node scripts/validate-life-skills-bank.mjs {{TOPIC_ID}}`
4. Fix any ERRORs the validator flags. Warnings are advisory.
5. Update `recovery_strategy` at the top of the bank file from the `AUTHOR:` placeholder to a real one-sentence remediation hint Ruby can use when the learner is struggling on this topic overall.

## When to re-author vs adjust

- **Validator errors:** ask Claude to fix specifically, citing the error text.
- **Cultural slip-ups** (US references, etc.): fix by hand, faster than re-prompting.
- **Whole topic feels off** (wrong tone, wrong reading level): re-run the prompt with sharper guidance in a fresh chat.
