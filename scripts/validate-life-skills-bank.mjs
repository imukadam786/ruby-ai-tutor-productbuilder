// Validates the Life Skills consolidated bank against the skill tree and the
// BankQuestion item schema. This is the gate: malformed content bounces back
// with actionable messages BEFORE anything reaches production.
//
//   node scripts/validate-life-skills-bank.mjs                 (validate all)
//   node scripts/validate-life-skills-bank.mjs all             (same)
//   node scripts/validate-life-skills-bank.mjs LS.L1.BKH.T01   (one topic)
//   node scripts/validate-life-skills-bank.mjs LS.L1.BKH.T01 LS.L1.BKH.T02
//
// ERROR = blocks the topic (engine would break or content is mis-wired).
// WARN  = scaffold/advisory (e.g. empty questions, AUTHOR: placeholders).
// Exit code 1 if any ERROR anywhere, else 0.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-skills-question-bank.json");
const TREE_PATH = path.join(ROOT, "data/life-skills-skill-tree.json");

const ALLOWED_GATES = new Set(["NONE"]);
const KNOWN_INPUT_TYPES = new Set([
  "choice",
  "image-match",
  "audio-tap",
  "sequence",
  "text",
  "true-false",
  "numeric",
]);

const num = (v) => typeof v === "number" && Number.isFinite(v);
const str = (v) => typeof v === "string" && v.length > 0;
const arr = Array.isArray;
const bool = (v) => typeof v === "boolean";

function loadOrDie(file, label) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: ${label} not found at ${file}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`ERROR: ${label} is invalid JSON — ${e.message}`);
    process.exit(1);
  }
}

const bank = loadOrDie(BANK_PATH, "bank file");
const tree = loadOrDie(TREE_PATH, "skill tree");

// Flatten the tree: bank_skill_id → { level, tier, skill }.
const TREE_INDEX = new Map();
for (const level of tree.levels) {
  for (const tier of level.tiers ?? []) {
    for (const skill of tier.atomic_skills ?? []) {
      TREE_INDEX.set(skill.bank_skill_id, { level, tier, skill });
    }
  }
}

function validateItem(item, idx, errors, warns) {
  const where = `questions[${idx}]`;
  if (!item || typeof item !== "object") {
    errors.push(`${where}: not an object`);
    return;
  }
  if (!str(item.ref)) errors.push(`${where}: missing/empty "ref"`);
  if (!str(item.question)) errors.push(`${where}: missing/empty "question"`);
  if (item.expected === undefined || item.expected === null)
    errors.push(`${where}: missing "expected"`);
  else if (typeof item.expected !== "string" && typeof item.expected !== "number")
    errors.push(`${where}: "expected" must be string or number`);
  if (!str(item.input_type)) errors.push(`${where}: missing/empty "input_type"`);
  else if (!KNOWN_INPUT_TYPES.has(item.input_type))
    warns.push(`${where}: "input_type" "${item.input_type}" not in known set — extend KNOWN_INPUT_TYPES if intentional`);

  if (!arr(item.error_signals)) errors.push(`${where}: missing "error_signals" array`);
  else if (item.error_signals.length === 0) warns.push(`${where}: "error_signals" is empty`);
  else if (!item.error_signals.every(str)) errors.push(`${where}: every "error_signals" entry must be a non-empty string`);

  if (!str(item.ruby_prompt)) errors.push(`${where}: missing/empty "ruby_prompt"`);
  if (!str(item.memo)) warns.push(`${where}: missing "memo" (Ruby's wrong-answer explanation)`);

  if (item.context !== undefined && !str(item.context))
    errors.push(`${where}: "context" must be a non-empty string if present`);
  if (item.difficulty !== undefined && (!num(item.difficulty) || item.difficulty < 1 || item.difficulty > 5))
    errors.push(`${where}: "difficulty" must be a number 1–5`);

  if (item.input_type === "choice" || item.input_type === "image-match" || item.input_type === "audio-tap") {
    if (!arr(item.options) || item.options.length < 2)
      errors.push(`${where}: "${item.input_type}" needs "options" with ≥2 entries`);
  }
  if (item.input_type === "true-false") {
    if (typeof item.expected !== "string" || !["true", "false", "True", "False"].includes(item.expected))
      errors.push(`${where}: "true-false" expected must be "true" or "false"`);
  }
  if (item.input_type === "sequence") {
    if (!arr(item.options) || item.options.length < 2)
      errors.push(`${where}: "sequence" needs "options" with ≥2 entries (items to be ordered)`);
  }
}

function validateTopic(topicId) {
  const errors = [];
  const warns = [];

  const topic = bank.topics?.[topicId];
  if (!topic) {
    console.log(`\n■ ${topicId} — NOT FOUND in bank.topics`);
    return { topicId, errors: 1, warns: 0 };
  }

  if (!str(topic.title)) errors.push(`top: missing "title"`);
  if (!num(topic.grade)) errors.push(`top: missing "grade" (number)`);
  if (!str(topic.strand)) errors.push(`top: missing "strand"`);
  if (!arr(topic.skill_ids) || topic.skill_ids.length === 0)
    errors.push(`top: "skill_ids" must be a non-empty array`);
  if (!str(topic.gate) || !ALLOWED_GATES.has(topic.gate))
    errors.push(`top: "gate" "${topic.gate}" invalid (allowed: ${[...ALLOWED_GATES].join(", ")})`);
  if (!num(topic.pass_threshold) || topic.pass_threshold < 0 || topic.pass_threshold > 1)
    errors.push(`top: "pass_threshold" must be 0–1`);
  if (!num(topic.questions_for_mastery) || topic.questions_for_mastery < 1)
    errors.push(`top: "questions_for_mastery" must be a positive integer`);
  if (!num(topic.target_item_count) || topic.target_item_count < 1)
    errors.push(`top: "target_item_count" must be a positive integer`);
  if (topic.sensitive !== undefined && !bool(topic.sensitive))
    errors.push(`top: "sensitive" must be boolean if present`);
  if (!arr(topic.questions))
    errors.push(`top: "questions" must be an array (may be empty in scaffold)`);

  const treeNode = TREE_INDEX.get(topicId);
  if (!treeNode) {
    errors.push(`top: topic id not found in life-skills-skill-tree.json`);
  } else {
    if (topic.grade !== treeNode.level.grade)
      errors.push(`top: "grade" ${topic.grade} disagrees with tree (${treeNode.level.grade})`);
    if (topic.title !== treeNode.skill.title)
      warns.push(`top: "title" differs from tree ("${topic.title}" vs "${treeNode.skill.title}")`);
    if (topic.sensitive !== (treeNode.skill.sensitive === true))
      warns.push(`top: "sensitive" (${topic.sensitive}) disagrees with tree (${treeNode.skill.sensitive === true})`);
  }

  if (arr(topic.questions) && topic.questions.length === 0) {
    warns.push(`top: "questions" is empty — scaffold state`);
  } else if (arr(topic.questions)) {
    if (topic.questions.length < topic.target_item_count)
      warns.push(`top: ${topic.questions.length}/${topic.target_item_count} items authored — below target`);
    const seen = new Set();
    topic.questions.forEach((it, i) => {
      validateItem(it, i, errors, warns);
      if (it && str(it.ref)) {
        if (seen.has(it.ref)) errors.push(`questions[${i}]: duplicate "ref" "${it.ref}"`);
        seen.add(it.ref);
      }
    });
  }

  if (typeof topic.recovery_strategy === "string" && topic.recovery_strategy.startsWith("AUTHOR:")) {
    warns.push(`top: "recovery_strategy" still has AUTHOR: placeholder`);
  }

  const status = errors.length === 0 ? (warns.length === 0 ? "✓ CLEAN" : "✓ pass (with warnings)") : "✗ FAIL";
  console.log(`\n${status}  ${topicId}  (${errors.length} error, ${warns.length} warn)`);
  errors.forEach((m) => console.log(`  ✗ ${m}`));
  warns.forEach((m) => console.log(`  ⚠ ${m}`));
  return { topicId, errors: errors.length, warns: warns.length };
}

function main() {
  const args = process.argv.slice(2);
  const targets =
    args.length === 0 || (args.length === 1 && args[0].toLowerCase() === "all")
      ? Object.keys(bank.topics ?? {}).sort()
      : args;

  if (targets.length === 0) {
    console.log("No topics in bank.topics. Nothing to validate.");
    process.exit(0);
  }

  let totalErrors = 0;
  let totalWarns = 0;
  for (const t of targets) {
    const r = validateTopic(t);
    totalErrors += r.errors;
    totalWarns += r.warns;
  }

  console.log(`\n──── Summary: ${targets.length} topic(s), ${totalErrors} error(s), ${totalWarns} warning(s) ────`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
