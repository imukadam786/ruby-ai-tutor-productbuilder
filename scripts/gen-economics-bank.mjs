// Assembles data/economics-question-bank.json from:
//   • the skill tree (topic metadata), and
//   • the per-grade authoring pools in data/economics-authoring/*.mjs
//
// Validates every pool (count, refs unique, shapes valid) and reports coverage.
// Pools not yet authored are written with an empty questions array so the file
// stays valid during the content phase. Run: node scripts/gen-economics-bank.mjs
import { readFileSync, writeFileSync } from "node:fs";

const tree = JSON.parse(
  readFileSync(new URL("../data/economics-skill-tree.json", import.meta.url)),
);

const grades = await Promise.all([
  import("../data/economics-authoring/grade10.mjs"),
  import("../data/economics-authoring/grade11.mjs"),
  import("../data/economics-authoring/grade12.mjs"),
]);
const POOLS = Object.assign({}, ...grades.map((g) => g.POOLS ?? {}));

const VALID_TYPES = new Set([
  "choice", "true-false", "cloze", "sequence", "diagram-label", "image-match",
  "sort-buckets", "highlight-source", "argument-builder", "paragraph-template",
  "source-comparison",
]);

const errors = [];
function validateQuestion(skillId, q) {
  const where = `${skillId} / ${q?.ref ?? "?"}`;
  if (!q.ref) errors.push(`${where}: missing ref`);
  if (!q.question) errors.push(`${where}: missing question`);
  if (!VALID_TYPES.has(q.input_type)) errors.push(`${where}: bad input_type ${q.input_type}`);
  if (typeof q.difficulty !== "number" || q.difficulty < 1 || q.difficulty > 3)
    errors.push(`${where}: difficulty must be 1-3`);
  if (!q.memo) errors.push(`${where}: missing memo`);
  switch (q.input_type) {
    case "choice": case "cloze": case "sequence":
      if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: needs >=2 options`);
      if (!q.options?.includes(q.expected)) errors.push(`${where}: expected not in options`);
      break;
    case "diagram-label": case "image-match":
      if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: needs >=2 options`);
      if (!q.options?.includes(q.expected)) errors.push(`${where}: expected not in options`);
      if (!Array.isArray(q.image_refs) || q.image_refs.length === 0) errors.push(`${where}: diagram needs image_refs`);
      break;
    case "true-false":
      if (!["True", "False"].includes(q.expected)) errors.push(`${where}: tf expected must be True/False`);
      break;
    case "sort-buckets":
      if (!q.buckets?.length || !q.items?.length) errors.push(`${where}: sort needs buckets+items`);
      for (const it of q.items ?? [])
        if (!q.buckets.some((b) => b.id === it.correct_bucket)) errors.push(`${where}: item ${it.id} bucket not found`);
      break;
    case "source-comparison":
      if (!q.source_a || !q.source_b || !q.statements?.length) errors.push(`${where}: source-comparison incomplete`);
      break;
    case "paragraph-template":
      if (!q.template?.length) errors.push(`${where}: paragraph-template needs slots`);
      break;
    default:
      break;
  }
}

const TARGET = 20;
const topics = {};
const coverage = [];
for (const lvl of tree.levels) {
  for (const tier of lvl.tiers) {
    for (const s of tier.atomic_skills) {
      const questions = POOLS[s.id] ?? [];
      const refs = new Set();
      for (const q of questions) {
        if (refs.has(q.ref)) errors.push(`${s.id}: duplicate ref ${q.ref}`);
        refs.add(q.ref);
        validateQuestion(s.id, q);
      }
      coverage.push({ id: s.id, n: questions.length });
      topics[s.id] = {
        title: s.title,
        description: s.description,
        grade: lvl.grade,
        strand: tier.title,
        skill_ids: [s.id],
        gate: "NONE",
        pass_threshold: 0.6,
        questions_for_mastery: TARGET,
        target_item_count: TARGET,
        caps_term: s.caps_term,
        caps_topic: s.caps_topic,
        templates: s.templates,
        recovery_strategy: s.recovery_strategy,
        questions,
      };
    }
  }
}

const authored = coverage.filter((c) => c.n > 0).length;
const totalItems = coverage.reduce((n, c) => n + c.n, 0);
const short = coverage.filter((c) => c.n > 0 && c.n < TARGET);

const bank = {
  version: "1.0",
  subject: "economics",
  description:
    "Economics question bank, FET (CAPS Grades 10-12). Keyed by atomic skill id. Each pool targets 20 items, FET pass mark 0.6, no timer. Cognitive mix per CAPS: ~30% Knowledge/Comprehension (difficulty 1), ~40% Application/Analysis (difficulty 2), ~30% Synthesis/Evaluation (difficulty 3). Tap-based mechanics only (no free-text): choice, true-false, cloze, sequence, diagram-label (graph reading), sort-buckets, paragraph-template and source-comparison. Authored from data/economics-authoring/grade{10,11,12}.mjs via scripts/gen-economics-bank.mjs.",
  topics,
};

if (errors.length) {
  console.error(`VALIDATION FAILED — ${errors.length} error(s):`);
  for (const e of errors.slice(0, 60)) console.error("  • " + e);
  process.exit(1);
}

writeFileSync(
  new URL("../data/economics-question-bank.json", import.meta.url),
  JSON.stringify(bank, null, 2) + "\n",
);

console.log(`Wrote data/economics-question-bank.json`);
console.log(`Pools authored: ${authored}/${coverage.length} · total items: ${totalItems}`);
if (short.length) {
  console.log(`Pools under ${TARGET}: ` + short.map((c) => `${c.id}(${c.n})`).join(", "));
} else if (authored === coverage.length) {
  console.log(`All ${coverage.length} pools complete at ${TARGET}+ items.`);
}
