// Validates the Life Sciences consolidated bank against the skill tree and
// the FET BankQuestion item schema. Mirrors validate-life-skills-bank.mjs but
// allows the FET-specific input types `cloze`, `match`, `scenario`,
// `diagram-label`, `data-interpret`, and `short-response`, and treats
// `ruby_prompt` as optional (FET items often read fine without it).
//
//   node scripts/validate-life-sciences-bank.mjs                       (all)
//   node scripts/validate-life-sciences-bank.mjs all                   (same)
//   node scripts/validate-life-sciences-bank.mjs LSC.G10.S1.CHEM.A1    (one)
//
// ERROR = blocks the topic (engine breaks or content mis-wired).
// WARN  = scaffold/advisory (e.g. empty questions, below target).
// Exit code 1 if any ERROR, else 0.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BANK_PATH = path.join(ROOT, "data/life-sciences-question-bank.json");
const TREE_PATH = path.join(ROOT, "data/life-sciences-skill-tree.json");

const ALLOWED_GATES = new Set(["NONE"]);
const KNOWN_INPUT_TYPES = new Set([
  "choice",
  "true-false",
  "cloze",
  "match",
  "sequence",
  "scenario",
  "diagram-label",
  "data-interpret",
  "short-response",
  "text",
  "numeric",
]);

const num = (v) => typeof v === "number" && Number.isFinite(v);
const str = (v) => typeof v === "string" && v.length > 0;
const arr = Array.isArray;
const bool = (v) => typeof v === "boolean";
const obj = (v) => v && typeof v === "object" && !Array.isArray(v);

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
  if (!obj(item)) {
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

  if (item.ruby_prompt !== undefined && !str(item.ruby_prompt))
    errors.push(`${where}: "ruby_prompt" must be a non-empty string if present`);
  if (!str(item.memo)) warns.push(`${where}: missing "memo" (Ruby's reteach explanation)`);

  if (item.context !== undefined && !str(item.context))
    errors.push(`${where}: "context" must be a non-empty string if present`);
  if (item.difficulty !== undefined && (!num(item.difficulty) || item.difficulty < 1 || item.difficulty > 5))
    errors.push(`${where}: "difficulty" must be a number 1–5`);

  // Per-input-type rules.
  const needsOptions = new Set(["choice", "true-false", "cloze", "match", "sequence", "scenario", "diagram-label"]);
  if (needsOptions.has(item.input_type)) {
    if (!arr(item.options) || item.options.length < 2)
      errors.push(`${where}: "${item.input_type}" needs "options" with ≥2 entries`);
    else if (str(item.expected) && !item.options.includes(item.expected))
      warns.push(`${where}: "expected" ("${item.expected}") not in "options" — typo?`);
  }
  if (item.input_type === "true-false") {
    const ok = ["True", "False", "true", "false"];
    if (!ok.includes(String(item.expected)))
      errors.push(`${where}: "true-false" expected must be "True" or "False"`);
  }
  if (item.input_type === "short-response") {
    if (item.rubric !== undefined) {
      if (!obj(item.rubric)) errors.push(`${where}: "rubric" must be an object`);
      else {
        if (!arr(item.rubric.must_mention) || item.rubric.must_mention.length === 0)
          errors.push(`${where}: "rubric.must_mention" must be a non-empty array`);
        if (item.rubric.max_marks !== undefined && (!num(item.rubric.max_marks) || item.rubric.max_marks < 1))
          errors.push(`${where}: "rubric.max_marks" must be a positive number when present`);
      }
    } else {
      warns.push(`${where}: "short-response" has no "rubric" — AI judge will fall back to a generic match`);
    }
  }
  if (item.input_type === "data-interpret") {
    if (item.data === undefined)
      warns.push(`${where}: "data-interpret" missing "data" object — stem may not render a table/graph`);
    else if (!obj(item.data)) errors.push(`${where}: "data-interpret" "data" must be an object`);
  }
  if (item.input_type === "diagram-label") {
    if (!arr(item.image_refs) || item.image_refs.length === 0)
      warns.push(`${where}: "diagram-label" missing "image_refs" — diagram will not render until manifest is updated`);
  }
  // image_refs parallel-to-options check (applies to image-match etc. — same
  // rule as Life Skills). diagram-label uses image_refs differently (one ref
  // = the diagram, options refer to labels A/B/C/D).
  if (item.image_refs !== undefined) {
    if (!arr(item.image_refs))
      errors.push(`${where}: "image_refs" must be an array when present`);
    else if (
      item.input_type !== "diagram-label" &&
      arr(item.options) &&
      item.image_refs.length !== item.options.length
    ) {
      errors.push(`${where}: "image_refs" (${item.image_refs.length}) must match "options" length (${item.options.length})`);
    }
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
  if (!arr(topic.questions))
    errors.push(`top: "questions" must be an array (may be empty in scaffold)`);

  const treeNode = TREE_INDEX.get(topicId);
  if (!treeNode) {
    errors.push(`top: topic id not found in life-sciences-skill-tree.json`);
  } else {
    if (topic.grade !== treeNode.level.grade)
      errors.push(`top: "grade" ${topic.grade} disagrees with tree (${treeNode.level.grade})`);
    if (topic.title !== treeNode.skill.title)
      warns.push(`top: "title" differs from tree ("${topic.title}" vs "${treeNode.skill.title}")`);
  }

  // FET rule: pass_threshold should be 0.6, target 20 items per pool.
  if (topic.pass_threshold !== undefined && topic.pass_threshold !== 0.6)
    warns.push(`top: "pass_threshold" is ${topic.pass_threshold} — FET rule is 0.6`);
  if (topic.target_item_count !== undefined && topic.target_item_count !== 20)
    warns.push(`top: "target_item_count" is ${topic.target_item_count} — FET target is 20`);

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

  // Tree-coverage report: list bank topics still missing for Gr10.
  const treeIds = [...TREE_INDEX.keys()];
  const bankIds = new Set(Object.keys(bank.topics ?? {}));
  const missing = treeIds.filter((id) => id.startsWith("LSC.G10.") && !bankIds.has(id));
  if (missing.length) {
    console.log(`\n■ Grade 10 tree coverage: ${treeIds.filter((i) => i.startsWith("LSC.G10.")).length - missing.length}/${treeIds.filter((i) => i.startsWith("LSC.G10.")).length} skills authored — ${missing.length} missing.`);
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
