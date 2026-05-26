// Pull every text-input Life Skills question into a working file so the head of
// education can review AI-drafted multiple-choice options before they get merged
// back into the bank.
//
//   node scripts/export-life-skills-text-rewrites.mjs               (draft missing entries)
//   node scripts/export-life-skills-text-rewrites.mjs --dry-run     (no API calls; empty drafts)
//   node scripts/export-life-skills-text-rewrites.mjs --refresh ID  (re-draft one ref id, e.g. T01.08)
//   node scripts/export-life-skills-text-rewrites.mjs --refresh-all (re-draft everything)
//
// Output file: data/life-skills-mcq-rewrites.json
//   Resumable — already-drafted entries are skipped unless --refresh* is set.
//
// Workflow:
//   1. Run this script (creates / updates the working file)
//   2. Head of ed reviews and edits options/expected in the working file
//   3. Run scripts/import-life-skills-mcq-rewrites.mjs to merge into the bank
//   4. Run scripts/validate-life-skills-bank.mjs to confirm the bank still passes

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const OUT_PATH = path.join(ROOT, "data/life-skills-mcq-rewrites.json");

const DRY_RUN = process.argv.includes("--dry-run");
const REFRESH_ALL = process.argv.includes("--refresh-all");
const refreshIdx = process.argv.indexOf("--refresh");
const REFRESH_ID = refreshIdx >= 0 ? process.argv[refreshIdx + 1] : null;

const MODEL = process.env.OPENAI_MODEL_SMART || "gpt-4o";

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function gradeFromTopicId(tid) {
  const m = tid.match(/LS\.L(\d)/);
  return m ? parseInt(m[1], 10) : 1;
}

function targetOptionCount(grade) {
  return grade === 1 ? 3 : 4;
}

const SYSTEM = `You convert open-ended Life Skills questions (Foundation Phase, South Africa, Grades 1-3) into multiple-choice questions.

RULES:
- Output JSON only. No prose. No markdown fences.
- Options are short (max 4 words) and child-friendly.
- Exactly one option is clearly correct. The rest are plausible but wrong (no joke answers, no "all of the above").
- Stay in South African context: use SA place names, foods, customs where relevant; avoid US-centric examples.
- Match the existing memo's intent — the correct option must be consistent with the memo.
- For Grade 1 produce 3 options. For Grade 2-3 produce 4 options.
- The "expected" value MUST exactly match one of the options strings.`;

function buildUserPrompt({ stem, memo, grade, topicTitle, hint, optionCount }) {
  return `Topic: ${topicTitle}
Grade: ${grade}
Question: ${stem}
Existing model answer (use as the correct option, paraphrased if needed): ${hint || "(none — infer the best correct answer from the memo)"}
Memo / teaching note: ${memo || "(none)"}

Produce ${optionCount} multiple-choice options. Return JSON in this exact shape:
{
  "options": ["...", "...", ...],
  "expected": "...",
  "rationale": "one sentence explaining why the correct option is right"
}`;
}

async function draftOptions(openai, q, topicTitle, grade) {
  const optionCount = targetOptionCount(grade);
  const userPrompt = buildUserPrompt({
    stem: q.question,
    memo: q.memo,
    grade,
    topicTitle,
    hint: q.expected,
    optionCount,
  });

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.options) || parsed.options.length !== optionCount) {
    throw new Error(`Model returned ${parsed.options?.length ?? 0} options, expected ${optionCount}`);
  }
  if (!parsed.options.includes(parsed.expected)) {
    throw new Error(`"expected" (${parsed.expected}) is not in the options list`);
  }
  return parsed;
}

function emptyDraft(optionCount) {
  return {
    options: Array(optionCount).fill(""),
    expected: "",
    rationale: "",
  };
}

function findTextQuestions(bank) {
  const out = [];
  for (const tid of Object.keys(bank.topics)) {
    const topic = bank.topics[tid];
    for (const q of topic.questions || []) {
      if (q.input_type === "text") {
        out.push({ tid, topicTitle: topic.title, q });
      }
    }
  }
  return out;
}

async function main() {
  const bank = loadJson(BANK_PATH);
  const textQs = findTextQuestions(bank);
  console.log(`Found ${textQs.length} text-input questions in ${Object.keys(bank.topics).length} topics.`);

  let working;
  if (fs.existsSync(OUT_PATH)) {
    working = loadJson(OUT_PATH);
    console.log(`Loaded existing working file with ${Object.keys(working.entries || {}).length} entries.`);
  } else {
    working = { generated_at: new Date().toISOString(), model: MODEL, entries: {} };
  }

  const openai = DRY_RUN ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  if (!DRY_RUN && !process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY is not set. Use --dry-run to scaffold without drafts.");
    process.exit(1);
  }

  let drafted = 0;
  let skipped = 0;
  let failed = 0;

  for (const { tid, topicTitle, q } of textQs) {
    const key = `${tid}::${q.ref}`;
    const grade = gradeFromTopicId(tid);
    const optionCount = targetOptionCount(grade);
    const existing = working.entries[key];

    const shouldRefresh = REFRESH_ALL || (REFRESH_ID && q.ref === REFRESH_ID);
    const hasGoodDraft = existing?.options?.length === optionCount && existing.expected;

    if (hasGoodDraft && !shouldRefresh) {
      skipped++;
      continue;
    }

    const base = {
      topic_id: tid,
      ref: q.ref,
      topic_title: topicTitle,
      grade,
      stem: q.question,
      ruby_prompt: q.ruby_prompt,
      memo: q.memo,
      original_expected: q.expected,
      difficulty: q.difficulty,
      error_signals: q.error_signals,
    };

    if (DRY_RUN) {
      working.entries[key] = { ...base, ...emptyDraft(optionCount), ai_drafted: false };
      drafted++;
    } else {
      try {
        process.stdout.write(`[${drafted + skipped + failed + 1}/${textQs.length}] drafting ${key}... `);
        const draft = await draftOptions(openai, q, topicTitle, grade);
        working.entries[key] = { ...base, ...draft, ai_drafted: true };
        drafted++;
        process.stdout.write("ok\n");
        // Save after each successful draft so a crash doesn't lose work
        fs.writeFileSync(OUT_PATH, JSON.stringify(working, null, 2));
      } catch (err) {
        failed++;
        process.stdout.write(`FAILED: ${err.message}\n`);
        working.entries[key] = { ...base, ...emptyDraft(optionCount), ai_drafted: false, error: err.message };
      }
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(working, null, 2));
  console.log(`\nDone. drafted=${drafted} skipped=${skipped} failed=${failed}`);
  console.log(`Working file: ${path.relative(ROOT, OUT_PATH)}`);
  console.log("Next: head of ed reviews the file, then run import-life-skills-mcq-rewrites.mjs");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
