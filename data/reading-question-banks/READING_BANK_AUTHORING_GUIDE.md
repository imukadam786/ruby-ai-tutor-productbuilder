# English Question Bank — Authoring Guide (Grades 7–12)

For the Head of Education. This explains exactly what to put in the
`L9.json` … `L14.json` files so the questions work inside the tutor.

| File | Grade | File | Grade |
|---|---|---|---|
| `L9.json` | 7 | `L12.json` | 10 |
| `L10.json` | 8 | `L13.json` | 11 |
| `L11.json` | 9 | `L14.json` | 12 |

Each file is one grade. The skills are **already created for you** — every
skill from the curriculum is pre-listed with its correct ID, name, tier and
error codes. **You only fill in two things:**

1. `texts` — the reading passages learners will see.
2. `items` — the actual questions, inside each skill.

---

## The five golden rules

1. **Never change `skillId`, `level`, `grade`, or `tier`.** These wire each
   question to the curriculum. If you rename them the question disconnects
   from the tutor and will not be served. Add content; don't restructure.
2. **Every skill must end up with questions.** A skill with an empty
   `items` list is simply skipped — that part of the grade goes untaught.
3. **Replace every `AUTHOR:` placeholder.** `defaultPrompt` and
   `questionFormat` start as `"AUTHOR: ..."`. Write the real wording.
4. **Each question needs a unique `id`** within its skill (e.g. `A1.001`,
   `A1.002`). The tutor uses it so a learner isn't asked the same thing twice.
5. **Run the checker before handing the file back** (see bottom). It tells
   you, in plain English, exactly what's wrong and where.

---

## What a question (`item`) looks like

Every item has: an `id`, the source text or prompt, an `answerKey` (how the
computer marks it), `errorSignals` (which mistakes it can detect), and
`randomisable` (true if wording may be lightly shuffled).

There are **five marking types** (`answerKey.mode`). Pick the one that fits
how the skill is assessed. Use only these five.

### 1. `similarity-band` — open answer judged by meaning
Use for: main idea, central argument, "explain in your own words", evidence.
The computer compares the learner's answer to your model `reference` answer.

```json
{
  "id": "A1.001",
  "textId": "TA.001",
  "answerKey": {
    "mode": "similarity-band",
    "reference": "A model answer in one or two sentences that fully captures what a correct response must say.",
    "bands": { "green": 0.6, "amber": 0.4 },
    "copyRejectAt": 0.6
  },
  "errorSignals": ["DETAIL_AS_ARGUMENT", "TOPIC_LABEL_L9", "VERBATIM_COPY_L9"],
  "randomisable": true
}
```
- `reference`: the gold answer. Write it as a strong learner would.
- `bands.green` 0.6 = a learner who covers ≥60% of the meaning passes;
  `amber` 0.4 = partial. Keep 0.6 / 0.4 unless you have a reason.
- `copyRejectAt` 0.6 = if 60%+ is copied straight from the text, it fails.
- `textId` points to a passage in this file's `texts` list (see below).

### 2. `cloze` — fill in the missing words
Use for: vocabulary in context, close reading. You give a passage and list
which words are blanked and the accepted answers.

```json
{
  "id": "CA4.001",
  "title": "The Seasons",
  "passage": "Seasons change because the Earth moves around the sun at a slight ___ ...",
  "answerKey": {
    "mode": "cloze",
    "blanks": [
      { "index": 1, "answer": "angle", "synonyms": ["tilt"] }
    ],
    "semanticEquivAt": 0.85,
    "passAccuracy": 0.6
  },
  "errorSignals": ["WRONG_WORD"],
  "randomisable": false
}
```
- `blanks[].answer` = the correct word; `synonyms` = also accepted.
- `passAccuracy` 0.6 = learner must get 60% of blanks right.

### 3. `sequence` — put steps in order
Use for: procedures, "order these events", method steps.

```json
{
  "id": "BP.001",
  "title": "How to Plant a Seed",
  "procedureText": "The passage describing the process, in prose.",
  "answerKey": {
    "mode": "sequence",
    "order": ["Choose a sunny pot", "Fill with damp soil", "Push the seed in", "Cover and press", "Water carefully"],
    "minUnits": 4,
    "orderThreshold": 0.6
  },
  "errorSignals": ["WRONG_ORDER"],
  "randomisable": false
}
```
- `order` = the correct sequence (2+ steps), each step a short phrase.

### 4. `rubric` — writing, marked against a checklist
Use for: paragraphs, essays, structured/analytical/argumentative writing.
You list yes/no checks; the score is checks passed ÷ total.

```json
{
  "id": "WC1.001",
  "prompt": "Write an analytical paragraph arguing whether ... Use claim, evidence, explanation.",
  "answerKey": {
    "mode": "rubric",
    "checks": [
      { "id": "CHECK_1_CLAIM", "description": "Opens with a clear position statement." },
      { "id": "CHECK_2_EVIDENCE", "description": "Includes at least one specific detail from the text." },
      { "id": "CHECK_3_EXPLANATION", "description": "Explains why the evidence supports the claim." }
    ],
    "passFraction": 0.6,
    "compulsoryCheck": "CHECK_1_CLAIM"
  },
  "errorSignals": ["NO_CLAIM_SENTENCE", "NO_EVIDENCE_SENTENCE"],
  "randomisable": false
}
```
- `prompt` = what the learner is asked to write (no `textId` needed).
- `checks` = plain yes/no statements a marker could tick.
- `passFraction` 0.6 = pass at 60% of checks. `compulsoryCheck` (optional) =
  a check that must pass regardless.

### 5. `choice` — multiple choice
Use for: fact/opinion, identify-the-feature, single-best-answer.

```json
{
  "id": "FO.001",
  "question": "Is this statement a FACT or an OPINION? 'The author clearly dislikes the policy.'",
  "answerKey": { "mode": "choice", "options": ["Fact", "Opinion"], "correct": 1 },
  "errorSignals": ["FACT_OPINION_CONFUSION"],
  "randomisable": false
}
```
- `correct` is the position in `options`, counting from 0 (so `1` = "Opinion").

---

## The `texts` list (shared passages)

Reading skills that share a passage (e.g. several A-skills reading the same
text) reference it by `textId`. Put the passage once in the file's `texts`:

```json
"texts": [
  { "id": "TA.001", "context": "A", "title": "The Lost Dog", "body": "Full passage text here...", "wordCount": 132, "grade": 7 }
]
```
- `context`: `"A"` = story, `"B"` = information, `"C"` = data/procedure.
- An item then uses `"textId": "TA.001"` instead of repeating the passage.
- Writing prompts (`rubric`) and self-contained items use `prompt`,
  `passage`, or `procedureText` directly and need **no** `textId`.

---

## How many questions?

Aim for **8–10 items per reading/comprehension skill** and **4–6 per
writing skill** so learners aren't repeated quickly. More is better.

---

## Check your file before handing it back

From the project folder, run:

```
node scripts/validate-reading-bank.mjs L9
```

or check a file anywhere before placing it:

```
node scripts/validate-reading-bank.mjs "C:\path\to\L9.json"
```

It prints:
- **✗ ERROR** — must be fixed (the question would break or be mis-wired).
- **△ warn** — usually just "not authored yet"; safe while in progress.

A file is ready when it shows **✓ CLEAN** (or only warnings you understand).
Engineering wires nothing further — a clean file goes live for that grade.
