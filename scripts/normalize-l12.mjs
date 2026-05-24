// Normalise the L12 authored bank (Downloads) into the canonical reading-bank
// schema by INJECTING its items into the pre-wired scaffold rather than
// rebuilding skill metadata. The scaffold (data/reading-question-banks/L12.json)
// already carries the correct tree wiring — tier, grade, errorCode,
// passCondition, recovery — so we keep all of that and only fill items[].
// Mirrors scripts/normalize-l9-l11.mjs in spirit; L12 is structurally simpler:
//   - every item already uses the canonical rubric answerKey
//     (mode/checks[id,description]/passFraction) — no rubric reshaping needed.
//   - every source is inline `passage` (no texts[]/sharedTexts pool), so
//     texts[] stays [] and route.ts serves item.passage directly.
//   - the authored `question` is a one-line restatement; the full task with
//     all constraints lives in `stimulus`. route.ts serves
//     `item.question || item.prompt || defaultPrompt`, so we fold the full
//     stimulus into the served field — otherwise the learner never sees the
//     word count, structure, and register requirements.
// Faithful: original fields are preserved; nothing is dropped. Anything
// uncertain is flagged _needsReview, not silently broken.
//
// Run: node scripts/normalize-l12.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DL = "C:/Users/keega/Downloads";
const BANK = join(root, "data/reading-question-banks/L12.json");

const str = (v) => typeof v === "string" && v.trim().length > 0;

// Canonical rubric is the only authored mode. Keep it as-is, only repairing
// missing pieces so the validator's rubric branch passes.
function canonAnswerKey(ak, flag) {
  if (!ak || ak.mode !== "rubric") {
    flag(`unexpected answerKey.mode ${JSON.stringify(ak && ak.mode)}`);
    return { mode: "rubric", checks: [{ id: "CHECK_1", description: "Answer meets the skill requirements." }], passFraction: 0.6 };
  }
  const checks = (Array.isArray(ak.checks) ? ak.checks : []).map((c, i) => ({
    id: str(c.id) ? c.id : `CHECK_${i + 1}`,
    description: str(c.description) ? c.description : (typeof c === "string" ? c : JSON.stringify(c)),
  }));
  if (!checks.length) {
    flag("rubric has no checks");
    checks.push({ id: "CHECK_1", description: "Answer meets the skill requirements." });
  }
  return {
    mode: "rubric",
    checks,
    passFraction: typeof ak.passFraction === "number" ? ak.passFraction : 0.6,
    ...(ak.compulsoryCheck ? { compulsoryCheck: ak.compulsoryCheck } : {}),
  };
}

function canonItem(it) {
  const reviews = [];
  const flag = (why) => reviews.push(why);

  // Fold the full task into the served field. route.ts picks item.question
  // first, so the rich `stimulus` (constraints, word count, register) becomes
  // the question; the short authored `question` is appended as the explicit
  // deliverable when it adds something the stimulus tail does not already say.
  const stimulus = str(it.stimulus) ? it.stimulus.trim() : "";
  const ask = str(it.question) ? it.question.trim() : "";
  let served = stimulus;
  if (ask && !stimulus.includes(ask)) served = stimulus ? `${stimulus}\n\nTask: ${ask}` : ask;
  if (!served) flag("no stimulus/question — nothing to serve");

  const out = {
    ...it, // lossless: keep context, difficulty, expectedResponseStructure,
           // recoveryMapping, textIds, letterType/taskType/expectedFallacy…
    id: it.id,
    errorSignals: Array.isArray(it.errorSignals) ? it.errorSignals : [],
    randomisable: typeof it.randomisable === "boolean" ? it.randomisable : true,
    answerKey: canonAnswerKey(it.answerKey, flag),
  };
  if (str(it.passage)) out.passage = it.passage; // inline source (840 items)
  out.question = served;                          // what route.ts serves
  out.prompt = stimulus || served;                // validator hasSource + fallback
  // textIds here is authoring provenance only; route.ts keys off singular
  // `textId`, which we never set, so the inline passage is what's shown.

  if (reviews.length) out._needsReview = reviews.join("; ");
  return out;
}

const scaffold = JSON.parse(readFileSync(BANK, "utf8"));
const authored = JSON.parse(readFileSync(join(DL, "L12.json"), "utf8"));
const bySkill = new Map(authored.skills.map((s) => [s.skillId, s]));

scaffold.bankVersion = "1.0";
scaffold.texts = Array.isArray(scaffold.texts) ? scaffold.texts : []; // passages inline

const flags = [];
let totalItems = 0;
let totalReview = 0;

for (const sk of scaffold.skills) {
  const a = bySkill.get(sk.skillId);
  if (!a) { flags.push(`scaffold skill ${sk.skillId} has no authored counterpart`); continue; }

  // Replace AUTHOR: placeholders with a real fallback (every item carries its
  // own question, so defaultPrompt is pure backstop).
  if (!str(sk.defaultPrompt) || /^AUTHOR:/.test(sk.defaultPrompt))
    sk.defaultPrompt = `Complete the "${sk.name || sk.skillId}" task: read any source material provided and write the response described.`;
  if (/^AUTHOR:/.test(sk.questionFormat || ""))
    sk.questionFormat = `Extended written response for "${sk.name || sk.skillId}", scored against the rubric.`;
  if (!Array.isArray(sk.tolerance)) sk.tolerance = [];
  if (!Array.isArray(sk.recovery)) sk.recovery = [];

  const seen = new Set();
  sk.items = a.items.map((it) => {
    if (seen.has(it.id)) flags.push(`${sk.skillId}: duplicate item id ${it.id}`);
    seen.add(it.id);
    return canonItem(it);
  });
  totalItems += sk.items.length;
  bySkill.delete(sk.skillId);
}

for (const leftover of bySkill.keys())
  flags.push(`authored skill ${leftover} is not in the scaffold/skill tree — skipped`);

const reviews = scaffold.skills.flatMap((s) =>
  (s.items || []).filter((i) => i._needsReview).map((i) => `${s.skillId}/${i.id}: ${i._needsReview}`)
);
totalReview = reviews.length + flags.length;

writeFileSync(BANK, JSON.stringify(scaffold, null, 2));

const modes = {};
for (const s of scaffold.skills) for (const i of s.items || []) modes[i.answerKey.mode] = (modes[i.answerKey.mode] || 0) + 1;
console.log(
  `L12: ${scaffold.skills.length} skills, ${totalItems} items, ${scaffold.texts.length} texts, modes=${JSON.stringify(modes)}`
);
if (flags.length) console.log(`  structural flags (${flags.length}):\n   ` + flags.join("\n   "));
if (reviews.length) console.log(`  _needsReview (${reviews.length}):\n   ` + reviews.slice(0, 20).join("\n   ") + (reviews.length > 20 ? `\n   …and ${reviews.length - 20} more` : ""));
console.log(totalReview ? `\n${totalReview} item(s) flagged for review` : "\nclean — nothing flagged");
