// Merge the head-of-ed-reviewed MCQ rewrites back into the question bank.
//
//   node scripts/import-life-skills-mcq-rewrites.mjs              (dry-run by default)
//   node scripts/import-life-skills-mcq-rewrites.mjs --write      (actually write changes)
//
// Reads:  data/life-skills-mcq-rewrites.json   (produced by export-life-skills-text-rewrites.mjs)
// Writes: data/life-skills-question-bank.json   (only when --write)
//
// For each entry it converts the matching question in the bank from
// input_type "text" → "choice", injects the reviewed options, and updates
// "expected" to the chosen correct option. Entries that are still empty or
// fail validation are reported and skipped (the rest still merge).
//
// Run scripts/validate-life-skills-bank.mjs after a write to confirm the bank
// stays valid.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const REWRITES_PATH = path.join(ROOT, "data/life-skills-mcq-rewrites.json");
const WRITE = process.argv.includes("--write");

function loadJson(file) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: ${file} not found`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function gradeFromTopicId(tid) {
  const m = tid.match(/LS\.L(\d)/);
  return m ? parseInt(m[1], 10) : 1;
}

function validateEntry(key, entry) {
  const errors = [];
  if (!entry.topic_id) errors.push("missing topic_id");
  if (!entry.ref) errors.push("missing ref");
  if (!Array.isArray(entry.options)) errors.push("options is not an array");
  else {
    const grade = gradeFromTopicId(entry.topic_id);
    const expectedCount = grade === 1 ? 3 : 4;
    if (entry.options.length !== expectedCount) {
      errors.push(`expected ${expectedCount} options for grade ${grade}, got ${entry.options.length}`);
    }
    if (entry.options.some((o) => typeof o !== "string" || !o.trim())) {
      errors.push("one or more options is empty / non-string");
    }
    const dupes = entry.options.filter((o, i, a) => a.indexOf(o) !== i);
    if (dupes.length) errors.push(`duplicate option(s): ${dupes.join(", ")}`);
  }
  if (typeof entry.expected !== "string" || !entry.expected.trim()) {
    errors.push("missing or empty expected");
  } else if (Array.isArray(entry.options) && !entry.options.includes(entry.expected)) {
    errors.push(`expected "${entry.expected}" is not in the options list`);
  }
  return errors;
}

function main() {
  const bank = loadJson(BANK_PATH);
  const work = loadJson(REWRITES_PATH);
  const entries = work.entries || {};
  const keys = Object.keys(entries);

  let merged = 0;
  let skippedEmpty = 0;
  let skippedNoMatch = 0;
  let skippedInvalid = 0;
  const problems = [];

  for (const key of keys) {
    const entry = entries[key];

    // Skip empties (head of ed hasn't filled in or explicitly cleared)
    const hasContent = Array.isArray(entry.options) && entry.options.some((o) => typeof o === "string" && o.trim());
    if (!hasContent) {
      skippedEmpty++;
      continue;
    }

    const errs = validateEntry(key, entry);
    if (errs.length) {
      skippedInvalid++;
      problems.push({ key, errs });
      continue;
    }

    const topic = bank.topics[entry.topic_id];
    if (!topic) {
      skippedNoMatch++;
      problems.push({ key, errs: [`topic ${entry.topic_id} not found in bank`] });
      continue;
    }
    const idx = (topic.questions || []).findIndex((q) => q.ref === entry.ref);
    if (idx < 0) {
      skippedNoMatch++;
      problems.push({ key, errs: [`ref ${entry.ref} not found in topic ${entry.topic_id}`] });
      continue;
    }

    // Apply the merge (preserves other fields like ruby_prompt, memo, difficulty, error_signals).
    // If new_question is set, also rewrite the stem (some text questions need rewording
    // to make sense as MCQ — e.g. "Tell me one thing you like" → "Which of these is...").
    const original = topic.questions[idx];
    topic.questions[idx] = {
      ...original,
      ...(typeof entry.new_question === "string" && entry.new_question.trim()
        ? { question: entry.new_question.trim() }
        : {}),
      ...(typeof entry.new_ruby_prompt === "string" && entry.new_ruby_prompt.trim()
        ? { ruby_prompt: entry.new_ruby_prompt.trim() }
        : {}),
      input_type: "choice",
      options: entry.options.slice(),
      expected: entry.expected,
    };
    merged++;
  }

  console.log(`Mergeable: ${merged}/${keys.length}`);
  console.log(`  skipped (empty/unauthored): ${skippedEmpty}`);
  console.log(`  skipped (no matching question): ${skippedNoMatch}`);
  console.log(`  skipped (invalid): ${skippedInvalid}`);
  if (problems.length) {
    console.log(`\nProblems:`);
    for (const p of problems) {
      console.log(`  ${p.key}`);
      for (const e of p.errs) console.log(`    - ${e}`);
    }
  }

  if (!WRITE) {
    console.log(`\nDry run. Pass --write to apply ${merged} change(s) to the bank.`);
    return;
  }

  if (merged === 0) {
    console.log(`\nNothing to write.`);
    return;
  }

  // Back up the existing bank so a bad merge is recoverable
  const backupPath = BANK_PATH.replace(/\.json$/, `.backup-${Date.now()}.json`);
  fs.copyFileSync(BANK_PATH, backupPath);
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank, null, 2) + "\n");
  console.log(`\nWrote ${merged} change(s) to ${path.relative(ROOT, BANK_PATH)}`);
  console.log(`Backup: ${path.relative(ROOT, backupPath)}`);
  console.log(`Next: node scripts/validate-life-skills-bank.mjs`);
}

main();
